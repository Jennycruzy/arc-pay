import { useState, useRef, useEffect } from 'react'
import { Link2, Copy, Check, QrCode, ArrowRight, Send, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import QRCode from 'react-qr-code'
import { SplitInput } from '@/components/SplitInput'
import { usePaymentLinks } from '@/hooks/usePaymentLinks'
import { useNavigate } from 'react-router-dom'

const CreatePage = () => {
  const navigate = useNavigate()
  const { createLinks, loading: isCreatingLinks, error: createError } = usePaymentLinks()

  const [address, setAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [generated, setGenerated] = useState(false)
  const [copied, setCopied] = useState(false)
  const [generatedLinkId, setGeneratedLinkId] = useState<string | null>(null)

  const generatedCardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (generated && generatedCardRef.current) {
      setTimeout(() => {
        generatedCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    }
  }, [generated])

  const [splitAmounts, setSplitAmounts] = useState<number[]>([])
  const [isSplitMode, setIsSplitMode] = useState(false)
  const [expiresAt, setExpiresAt] = useState('')
  const [maxUses, setMaxUses] = useState('')

  // Explicitly using your Vercel domain for legacy links
  const shareUrl = `https://arc-pay-link.vercel.app/api/share?to=${address}&amount=${amount}`
  const payUrl = generatedLinkId ? `${window.location.origin}/pay?link=${generatedLinkId}` : shareUrl
  const isValid = address.startsWith('0x') && address.length === 42 && (isSplitMode ? splitAmounts.length > 0 : parseFloat(amount) > 0)

  const handleGenerate = async () => {
    if (!isValid) return

    const hasAdvancedFeatures = isSplitMode || expiresAt || maxUses;

    if (hasAdvancedFeatures) {
      const groupId = crypto.randomUUID();
      const amountsToCreate = isSplitMode ? splitAmounts : [parseFloat(amount)];

      const linksToCreate = amountsToCreate.map(amt => ({
        receiver_wallet: address,
        amount: amt,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        max_uses: maxUses ? parseInt(maxUses) : null,
        current_uses: 0,
        group_id: isSplitMode ? groupId : null,
      }));

      const data = await createLinks(linksToCreate);
      if (data && data.length > 0) {
        if (isSplitMode) {
          toast.success(`Created ${data.length} split links!`);
          navigate(`/dashboard/links?group=${groupId}`);
        } else {
          setGeneratedLinkId(data[0].id);
          setGenerated(true);
        }
      } else {
        toast.error("Failed to generate link. Check database connection or constraints.");
      }
    } else {
      setGeneratedLinkId(null);
      setGenerated(true);
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(payUrl)
    setCopied(true)
    toast.success('Link copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold gradient-text">Arc Pay-Link</h1>
          <p className="text-muted-foreground text-sm">
            Create a shareable payment link for USDC on Arc Testnet
          </p>
        </div>

        <div className="glass-card rounded-xl p-6 space-y-5 shadow-glow-lg">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Your Arc Wallet Address</label>
            <input
              type="text"
              placeholder="0x..."
              value={address}
              onChange={(e) => { setAddress(e.target.value); setGenerated(false) }}
              className="w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
          </div>

          {!isSplitMode && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <label className="text-sm font-medium text-foreground">Amount in USDC</label>
              <input
                type="number"
                placeholder="10.00"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setGenerated(false) }}
                className="w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>
          )}

          <SplitInput onSplitChange={(amounts, isModeActive) => { setSplitAmounts(amounts); setIsSplitMode(isModeActive); setGenerated(false); }} />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Expiration (Optional)</label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => { setExpiresAt(e.target.value); setGenerated(false) }}
                className="w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Max Uses (Optional)</label>
              <input
                type="number"
                placeholder="e.g. 5"
                min="1"
                value={maxUses}
                onChange={(e) => { setMaxUses(e.target.value); setGenerated(false) }}
                className="w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!isValid || isCreatingLinks}
            className="w-full gradient-primary text-primary-foreground font-semibold rounded-lg py-3 flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-glow"
          >
            {isCreatingLinks ? <Loader2 size={18} className="animate-spin" /> : <Link2 size={18} />}
            {isSplitMode ? `Generate ${splitAmounts.length} Links` : 'Generate Pay-Link'}
            {!isCreatingLinks && <ArrowRight size={16} />}
          </button>
        </div>

        {generated && (
          <div ref={generatedCardRef} className="glass-card rounded-xl p-6 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Your Pay-Link</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg bg-secondary px-3 py-2.5 text-xs text-foreground break-all border border-border">
                  {payUrl}
                </code>
                <button
                  onClick={handleCopy}
                  className="shrink-0 rounded-lg border border-border bg-secondary p-2.5 text-foreground hover:bg-muted transition-colors"
                >
                  {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                </button>
              </div>
              {copied && (
                <p className="text-xs text-green-400 animate-in fade-in">Copied to clipboard!</p>
              )}
            </div>

            <div className="flex flex-col items-center gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <QrCode size={14} />
                Scan to Pay
              </div>
              <div className="rounded-xl bg-foreground p-3">
                <QRCode value={payUrl} size={180} bgColor="hsl(0,0%,95%)" fgColor="hsl(240,6%,4%)" />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Pay me ${amount} USDC on Arc Testnet ⚡`)}&url=${encodeURIComponent(payUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                X
              </a>
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(payUrl)}&text=${encodeURIComponent(`Pay me ${amount} USDC on Arc Testnet ⚡`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                <Send size={15} />
                Telegram
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Pay me ${amount} USDC on Arc Testnet ⚡ ${payUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CreatePage