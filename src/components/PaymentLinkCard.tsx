import { Check, Copy, ExternalLink, QrCode } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import QRCode from 'react-qr-code';
import { PaymentLinkData } from '@/hooks/usePaymentLinks';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

interface PaymentLinkCardProps {
    linkData: PaymentLinkData;
}

export function PaymentLinkCard({ linkData }: PaymentLinkCardProps) {
    const [copied, setCopied] = useState(false);

    const payUrl = `${window.location.origin}/pay?link=${linkData.id}`;

    const isExpired = linkData.expires_at ? new Date(linkData.expires_at) < new Date() : false;
    const isMaxed = linkData.max_uses !== null && linkData.current_uses! >= linkData.max_uses!;

    let statusColor = 'bg-green-500/10 text-green-400 border-green-500/20';
    let statusText = 'ACTIVE';

    if (isExpired) {
        statusColor = 'bg-red-500/10 text-red-400 border-red-500/20';
        statusText = 'EXPIRED';
    } else if (isMaxed) {
        statusColor = 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
        statusText = 'MAX USES REACHED';
    }

    const handleCopy = async () => {
        await navigator.clipboard.writeText(payUrl);
        setCopied(true);
        toast.success('Link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="glass-card rounded-xl p-5 space-y-4 shadow-glow border border-border/50 hover:border-primary/30 transition-colors">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold text-foreground">{linkData.amount.toFixed(2)} USDC</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                        Uses: {linkData.current_uses} {linkData.max_uses ? `/ ${linkData.max_uses}` : ''}
                    </p>
                </div>
                <div className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-wider border ${statusColor}`}>
                    {statusText}
                </div>
            </div>

            <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg bg-secondary px-3 py-2.5 text-xs text-foreground truncate border border-border max-w-[200px] sm:max-w-full">
                    {payUrl}
                </code>
                <button
                    onClick={handleCopy}
                    className="shrink-0 rounded-lg border border-border bg-secondary p-2.5 text-foreground hover:bg-muted transition-colors"
                    title="Copy Link"
                >
                    {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                </button>

                <Dialog>
                    <DialogTrigger asChild>
                        <button className="shrink-0 rounded-lg border border-border bg-secondary p-2.5 text-foreground hover:bg-muted transition-colors" title="Show QR Code">
                            <QrCode size={16} />
                        </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md flex flex-col items-center justify-center p-8 bg-zinc-950 border-zinc-800">
                        <h3 className="text-lg font-semibold mb-4 text-zinc-100">Scan to Pay {linkData.amount} USDC</h3>
                        <div className="bg-white p-4 rounded-xl">
                            <QRCode value={payUrl} size={200} />
                        </div>
                        <p className="text-sm text-zinc-400 mt-6 text-center max-w-[250px] truncate">{payUrl}</p>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
                {linkData.expires_at ? (
                    <span>Expires: {new Date(linkData.expires_at).toLocaleString()}</span>
                ) : (
                    <span>No Expiration</span>
                )}
            </div>
        </div>
    );
}
