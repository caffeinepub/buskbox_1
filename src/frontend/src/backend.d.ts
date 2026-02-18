import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface MediaCardDTO {
    media: MediaItemWithStats;
    artist: ArtistWithStats;
    totalDonations: bigint;
}
export interface MediaItem {
    id: string;
    title: string;
    created: bigint;
    file: ExternalBlob;
    tags: Array<string>;
    artistId: Principal;
    description: string;
    category: MediaCategory;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface DonatePaymentInput {
    stripeAccessToken: string;
    donorName: string;
    artistId: Principal;
    message: string;
    timestamp: bigint;
    amount: bigint;
    recipientId: string;
}
export interface ArtistWithStats {
    totalDonations: bigint;
    profile: ArtistProfile;
}
export interface DonatePaymentOutput {
    message: string;
    paymentId: string;
    timestamp: bigint;
    amount: bigint;
    donor: string;
    recipientId: string;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface MediaItemWithStats {
    mediaItem: MediaItem;
    totalDonations: bigint;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface MediaItemInput {
    title: string;
    created: bigint;
    file: ExternalBlob;
    tags: Array<string>;
    artistId: Principal;
    description: string;
    category: MediaCategory;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface ArtistProfile {
    bio: string;
    externalLinks: Array<string>;
    donationsEnabled: boolean;
    displayName: string;
    stripeAccessToken?: string;
    avatar: ExternalBlob;
}
export interface UserProfile {
    name: string;
}
export enum MediaCategory {
    video = "video",
    liveSession = "liveSession",
    recording = "recording"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addStripeAccessToken(stripeAccessToken: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    deleteMediaItem(mediaId: string): Promise<void>;
    donate(paymentInput: DonatePaymentInput): Promise<DonatePaymentOutput>;
    getAllMediaItems(): Promise<Array<MediaItem>>;
    getArtist(artistId: Principal): Promise<ArtistProfile | null>;
    getCallerArtist(): Promise<ArtistProfile | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMediaItemCountByCategory(artistId: Principal, category: MediaCategory): Promise<bigint>;
    getMediaItemWithStats(mediaId: string): Promise<MediaCardDTO | null>;
    getMediaItemsByArtist(artistId: Principal): Promise<Array<MediaItem>>;
    getMediaItemsByCategory(category: MediaCategory): Promise<Array<MediaItem>>;
    getMediaWithArtistDonationContext(): Promise<Array<MediaCardDTO>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isDonationsEnabled(artistId: Principal): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    onboardArtist(profile: ArtistProfile): Promise<void>;
    revokeStripeAccessToken(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateArtist(profile: ArtistProfile): Promise<void>;
    uploadMediaItem(mediaInput: MediaItemInput): Promise<string>;
}
