import { useEffect, useState } from 'react';
import { usePaymentLinks, PaymentLinkData } from '@/hooks/usePaymentLinks';
import { PaymentLinkCard } from '@/components/PaymentLinkCard';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, RefreshCcw } from 'lucide-react';

export default function DashboardLinksPage() {
    const [searchParams] = useSearchParams();
    const groupId = searchParams.get('group');
    const { getLinksByGroup, loading } = usePaymentLinks();
    const [links, setLinks] = useState<PaymentLinkData[]>([]);

    const fetchLinks = async () => {
        if (groupId) {
            const data = await getLinksByGroup(groupId);
            setLinks(data);
        }
    };

    useEffect(() => {
        fetchLinks();
    }, [groupId]);

    if (!groupId) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="glass-card rounded-xl p-8 text-center max-w-sm space-y-3">
                    <p className="text-foreground font-semibold">No Group ID Provided</p>
                    <p className="text-muted-foreground text-sm">Cannot fetch payment links without a group ID.</p>
                    <Link to="/" className="text-primary hover:underline text-sm block mt-4">Return Home</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col p-4 md:p-8 max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
                    <ArrowLeft size={16} />
                    Back to Home
                </Link>

                <button
                    onClick={fetchLinks}
                    disabled={loading}
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />}
                    Refresh
                </button>
            </div>

            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-foreground">Payment Links</h1>
                <p className="text-muted-foreground">Manage and track your generated payment links for this group.</p>
            </div>

            {loading && links.length === 0 ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="animate-spin text-primary" size={32} />
                </div>
            ) : links.length === 0 ? (
                <div className="glass-card rounded-xl p-12 text-center text-muted-foreground">
                    No active links found for this group.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {links.map(link => (
                        <PaymentLinkCard key={link.id} linkData={link} />
                    ))}
                </div>
            )}
        </div>
    );
}
