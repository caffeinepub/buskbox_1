import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, Mic, Video, Heart, TrendingUp, Users } from 'lucide-react';
import { useGetAllMediaItems } from '../hooks/useQueries';
import MediaCard from '../components/media/MediaCard';
import MediaGrid from '../components/media/MediaGrid';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function LandingPage() {
  const { data: allMedia = [], isLoading } = useGetAllMediaItems();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const recentMedia = allMedia.slice(0, 8);

  const categories = [
    {
      name: 'Recordings',
      icon: Music,
      description: 'Studio tracks and original compositions',
      category: 'recording',
      color: 'text-chart-1'
    },
    {
      name: 'Live Sessions',
      icon: Mic,
      description: 'Raw performances and acoustic sets',
      category: 'liveSession',
      color: 'text-chart-2'
    },
    {
      name: 'Videos',
      icon: Video,
      description: 'Music videos and visual performances',
      category: 'video',
      color: 'text-chart-3'
    }
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/10 to-background py-20 md:py-32">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Share Your Music,
                <br />
                <span className="text-primary">Receive Support</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                BuskBox is the platform for musicians to showcase their talent and receive donations from fans around the world.
              </p>
              <div className="flex flex-wrap gap-4">
                {isAuthenticated ? (
                  <Button asChild size="lg">
                    <Link to="/dashboard">Go to Dashboard</Link>
                  </Button>
                ) : (
                  <Button asChild size="lg">
                    <Link to="/category/$category" params={{ category: 'recording' }}>Explore Music</Link>
                  </Button>
                )}
              </div>
            </div>
            <div className="relative">
              <img
                src="/assets/generated/landing-hero.dim_1600x900.png"
                alt="Street musician performing"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Browse by Category</h2>
            <p className="text-lg text-muted-foreground">Discover amazing music from talented artists</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link key={category.category} to="/category/$category" params={{ category: category.category }}>
                <Card className="h-full hover:shadow-lg transition-all hover:scale-105">
                  <CardHeader>
                    <category.icon className={`h-12 w-12 mb-4 ${category.color}`} />
                    <CardTitle>{category.name}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Media Section */}
      {recentMedia.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">Recent Uploads</h2>
                <p className="text-lg text-muted-foreground">Fresh music from our community</p>
              </div>
              <Button asChild variant="outline">
                <Link to="/category/$category" params={{ category: 'recording' }}>View All</Link>
              </Button>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : (
              <MediaGrid>
                {recentMedia.map((media) => (
                  <MediaCard key={media.id} media={media} />
                ))}
              </MediaGrid>
            )}
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why BuskBox?</h2>
            <p className="text-lg text-muted-foreground">The platform built for independent musicians</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Heart className="h-10 w-10 mb-4 text-accent" />
                <CardTitle>Direct Support</CardTitle>
                <CardDescription>
                  Fans can donate directly to artists. You keep 90% of every donation.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-10 w-10 mb-4 text-chart-1" />
                <CardTitle>Grow Your Audience</CardTitle>
                <CardDescription>
                  Share your music with a global audience and build your fanbase.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 mb-4 text-chart-2" />
                <CardTitle>Community Driven</CardTitle>
                <CardDescription>
                  Join a community of musicians and music lovers supporting each other.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-16 md:py-24">
          <div className="container">
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="py-12 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Share Your Music?</h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join BuskBox today and start receiving support from fans who love your music.
                </p>
                <Button size="lg" asChild>
                  <Link to="/dashboard">Get Started</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      )}
    </div>
  );
}
