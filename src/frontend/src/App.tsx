import { RouterProvider, createRouter, createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import AppLayout from './components/layout/AppLayout';
import LandingPage from './pages/LandingPage';
import CategoryBrowsePage from './pages/browse/CategoryBrowsePage';
import ArtistPage from './pages/artist/ArtistPage';
import ArtistDashboard from './pages/dashboard/ArtistDashboard';
import PaymentSuccess from './pages/payments/PaymentSuccess';
import PaymentFailure from './pages/payments/PaymentFailure';

const rootRoute = createRootRoute({
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage
});

const categoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/category/$category',
  component: CategoryBrowsePage
});

const artistRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/artist/$artistId',
  component: ArtistPage
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: ArtistDashboard
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-success',
  component: PaymentSuccess
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-failure',
  component: PaymentFailure
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  categoryRoute,
  artistRoute,
  dashboardRoute,
  paymentSuccessRoute,
  paymentFailureRoute
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
