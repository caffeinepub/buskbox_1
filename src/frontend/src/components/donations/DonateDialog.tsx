import { useState } from 'react';
import { useCreateCheckoutSession } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Heart, Loader2 } from 'lucide-react';
import type { ShoppingItem } from '../../backend';

interface DonateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mediaId: string;
  mediaTitle: string;
  artistName: string;
}

export default function DonateDialog({
  open,
  onOpenChange,
  mediaId,
  mediaTitle,
  artistName
}: DonateDialogProps) {
  const [amount, setAmount] = useState('5.00');
  const [donorName, setDonorName] = useState('');
  const [message, setMessage] = useState('');

  const createCheckout = useCreateCheckoutSession();

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum < 1) {
      toast.error('Please enter a valid amount (minimum $1)');
      return;
    }

    try {
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success?mediaId=${mediaId}`;
      const cancelUrl = `${baseUrl}/payment-failure?mediaId=${mediaId}`;

      const shoppingItem: ShoppingItem = {
        productName: `Support: ${mediaTitle}`,
        productDescription: `Donation to ${artistName} for "${mediaTitle}"${message ? ` - ${message}` : ''}${donorName ? ` from ${donorName}` : ''}`,
        priceInCents: BigInt(Math.round(amountNum * 100)),
        quantity: BigInt(1),
        currency: 'usd'
      };

      const session = await createCheckout.mutateAsync({
        items: [shoppingItem],
        successUrl,
        cancelUrl
      });

      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }

      window.location.href = session.url;
    } catch (error: any) {
      toast.error(error.message || 'Failed to start donation process');
    }
  };

  const presetAmounts = [5, 10, 20, 50];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-accent" />
            Support {artistName}
          </DialogTitle>
          <DialogDescription>
            Show your appreciation for "{mediaTitle}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleDonate} className="space-y-4">
          <div className="space-y-2">
            <Label>Amount (USD)</Label>
            <div className="flex gap-2 mb-2">
              {presetAmounts.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant={amount === preset.toFixed(2) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAmount(preset.toFixed(2))}
                  className="flex-1"
                >
                  ${preset}
                </Button>
              ))}
            </div>
            <Input
              type="number"
              step="0.01"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Custom amount"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="donorName">Your Name (optional)</Label>
            <Input
              id="donorName"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              placeholder="Anonymous"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Leave a message for the artist..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createCheckout.isPending}>
              {createCheckout.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Heart className="mr-2 h-4 w-4" />
                  Donate ${amount}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
