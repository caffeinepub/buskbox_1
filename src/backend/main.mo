import Map "mo:core/Map";
import Set "mo:core/Set";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  include MixinStorage();

  // Types
  public type MediaCategory = { #recording; #liveSession; #video };
  public type Donation = {
    donor : Text;
    amountCents : Nat;
    timestamp : Time.Time;
    message : Text;
  };

  public type ArtistProfile = {
    displayName : Text;
    bio : Text;
    avatar : Storage.ExternalBlob;
    externalLinks : [Text];
    stripeAccessToken : ?Text;
    donationsEnabled : Bool;
  };

  public type MediaItemDTO = {
    id : Text;
    title : Text;
    description : Text;
    category : MediaCategory;
    tags : [Text];
    file : Storage.ExternalBlob;
    artist : ArtistProfile;
    created : Int;
    totalDonations : Nat;
  };

  public type MediaItem = {
    id : Text;
    title : Text;
    description : Text;
    category : MediaCategory;
    tags : [Text];
    file : Storage.ExternalBlob;
    artistId : Principal;
    created : Int;
  };

  public type MediaItemInput = {
    title : Text;
    description : Text;
    category : MediaCategory;
    tags : [Text];
    file : Storage.ExternalBlob;
    artistId : Principal;
    created : Int;
  };

  module MediaItem {
    public func compareByCreated(media1 : MediaItem, media2 : MediaItem) : Order.Order {
      Int.compare(media2.created, media1.created); // Newest first
    };
  };

  public type DonatePaymentInput = {
    stripeAccessToken : Text;
    artistId : Principal;
    recipientId : Text;
    amount : Nat;
    donorName : Text;
    message : Text;
    timestamp : Int;
  };

  public type DonatePaymentOutput = {
    paymentId : Text;
    recipientId : Text;
    amount : Nat;
    donor : Text;
    message : Text;
    timestamp : Int;
  };

  // State
  let artists = Map.empty<Principal, ArtistProfile>();
  let mediaItems = Map.empty<Text, MediaItem>();
  let artistMedia = Map.empty<Principal, Set.Set<Text>>();
  let donations = Map.empty<Text, [Donation]>();

  var stripeConfiguration : ?Stripe.StripeConfiguration = null;

  // Artists
  public shared ({ caller }) func onboardArtist(profile : ArtistProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create artist profiles");
    };

    artists.add(caller, profile);
  };

  public query ({ caller }) func getCallerArtist() : async ?ArtistProfile {
    artists.get(caller);
  };

  public shared ({ caller }) func updateArtist(profile : ArtistProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update artist profiles");
    };

    artists.add(caller, profile);
  };

  public query ({ caller }) func getArtist(artistId : Principal) : async ?ArtistProfile {
    artists.get(artistId);
  };

  public query ({ caller }) func isDonationsEnabled(artistId : Principal) : async Bool {
    switch (artists.get(artistId)) {
      case (null) { false };
      case (?profile) { profile.donationsEnabled };
    };
  };

  // Media
  public shared ({ caller }) func uploadMediaItem(mediaInput : MediaItemInput) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can upload media");
    };

    // Retrieve artist profile
    let artistProfile = switch (artists.get(caller)) {
      case (null) { Runtime.trap("Artist profile not found. Please create an artist profile first.") };
      case (?profile) { profile };
    };

    // Create new media item with artistId
    let mediaId = Time.now().toText();
    let mediaItem = {
      mediaInput with
      id = mediaId;
      artistId = caller;
      created = Time.now();
    };

    // Persist media item
    mediaItems.add(mediaId, mediaItem);

    // Update artistMedia mapping
    let mediaSet = switch (artistMedia.get(caller)) {
      case (null) { Set.singleton(mediaId) };
      case (?existingSet) {
        existingSet.add(mediaId);
        existingSet;
      };
    };
    artistMedia.add(caller, mediaSet);

    mediaId;
  };

  public query ({ caller }) func getAllMediaItems() : async [MediaItem] {
    mediaItems.values().toArray().sort(MediaItem.compareByCreated);
  };

  public query ({ caller }) func getMediaItemsByArtist(artistId : Principal) : async [MediaItem] {
    let artistMediaIds = artistMedia.get(artistId);

    switch (artistMediaIds) {
      case (null) { [] };
      case (?mediaSet) {
        let allMedia = mediaItems.values().toArray();
        allMedia.filter(
          func(media) {
            mediaSet.contains(media.id);
          }
        );
      };
    };
  };

  public shared ({ caller }) func deleteMediaItem(mediaId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete media");
    };

    switch (mediaItems.get(mediaId)) {
      case (null) { Runtime.trap("Media item not found") };
      case (?media) {
        // Only artist who owns the media can delete
        if (caller != media.artistId) {
          Runtime.trap("Unauthorized: Only the artist who created this media can delete it");
        };

        // Remove from artistMedia set
        switch (artistMedia.get(caller)) {
          case (?mediaSet) {
            mediaSet.remove(mediaId);
          };
          case (null) {};
        };

        // Remove from mediaItems storage
        mediaItems.remove(mediaId);
      };
    };
  };

  public query ({ caller }) func getMediaItemsByCategory(category : MediaCategory) : async [MediaItem] {
    let allMedia = mediaItems.values().toArray();
    allMedia.filter(
      func(media) {
        media.category == category;
      }
    );
  };

  public query ({ caller }) func getMediaItemCountByCategory(artistId : Principal, category : MediaCategory) : async Nat {
    let artistMediaIds = switch (artistMedia.get(artistId)) {
      case (null) { return 0 };
      case (?mediaSet) {
        let allMedia = mediaItems.values().toArray();
        let filteredMedia = allMedia.filter(
          func(media) {
            mediaSet.contains(media.id);
          }
        );
        let categoryMedia = filteredMedia.filter(
          func(media) {
            media.category == category;
          }
        );
        return categoryMedia.size();
      };
    };
  };

  public query ({ caller }) func getMediaItem(mediaId : Text) : async ?MediaItemDTO {
    switch (mediaItems.get(mediaId)) {
      case (null) { null };
      case (?mediaItem) {
        // Add totalDonations field
        let totalDonations = switch (donations.get(mediaId)) {
          case (null) { 0 };
          case (?mediaDonations) {
            mediaDonations.foldLeft(
              0,
              func(acc, donation) { acc + donation.amountCents },
            );
          };
        };

        // Get the artist profile using the media item's artistId
        let artist = switch (artists.get(mediaItem.artistId)) {
          case (null) { Runtime.trap("Artist profile not found") };
          case (?profile) { profile };
        };

        let dto : MediaItemDTO = {
          id = mediaItem.id;
          title = mediaItem.title;
          description = mediaItem.description;
          category = mediaItem.category;
          tags = mediaItem.tags;
          file = mediaItem.file;
          artist;
          created = mediaItem.created;
          totalDonations;
        };
        ?dto;
      };
    };
  };

  // Donations
  public shared ({ caller }) func donate(paymentInput : DonatePaymentInput) : async DonatePaymentOutput {
    // Donations are open to all users including guests - no authentication check needed

    // Verify the media item exists
    switch (mediaItems.get(paymentInput.recipientId)) {
      case (null) { Runtime.trap("Media item not found") };
      case (?mediaItem) {
        // Verify donations are enabled for this artist
        switch (artists.get(mediaItem.artistId)) {
          case (null) { Runtime.trap("Artist not found") };
          case (?artistProfile) {
            if (not artistProfile.donationsEnabled) {
              Runtime.trap("Donations are not enabled for this artist");
            };
          };
        };
      };
    };

    // Process payment with Stripe
    let paymentId = Time.now().toText();

    // Create new donation record
    let donation : Donation = {
      donor = paymentInput.donorName;
      amountCents = paymentInput.amount;
      timestamp = Time.now();
      message = paymentInput.message;
    };

    // Add donation to media's donation list
    let existingDonations = switch (donations.get(paymentInput.recipientId)) {
      case (null) { [] };
      case (?donationsList) { donationsList };
    };
    donations.add(paymentInput.recipientId, existingDonations.concat([donation]));

    // Construct payment output
    let paymentOutput : DonatePaymentOutput = {
      paymentId;
      recipientId = paymentInput.recipientId;
      amount = paymentInput.amount;
      donor = paymentInput.donorName;
      message = paymentInput.message;
      timestamp = Time.now();
    };

    paymentOutput;
  };

  public shared ({ caller }) func addStripeAccessToken(stripeAccessToken : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can connect Stripe accounts");
    };

    // Retrieve current artist profile
    let existingProfile = switch (artists.get(caller)) {
      case (null) { Runtime.trap("Artist profile not found. Please create an artist profile first.") };
      case (?profile) { profile };
    };

    let updatedProfile = {
      existingProfile with
      stripeAccessToken = ?stripeAccessToken;
      donationsEnabled = true;
    };
    artists.add(caller, updatedProfile);
  };

  public shared ({ caller }) func revokeStripeAccessToken() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can disconnect Stripe accounts");
    };

    // Retrieve current artist profile
    let existingProfile = switch (artists.get(caller)) {
      case (null) { Runtime.trap("Artist profile not found") };
      case (?profile) { profile };
    };

    let updatedProfile = {
      existingProfile with
      stripeAccessToken = null;
      donationsEnabled = false;
    };
    artists.add(caller, updatedProfile);
  };

  // Stripe integration
  public query ({ caller }) func isStripeConfigured() : async Bool {
    stripeConfiguration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfiguration := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfiguration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};
