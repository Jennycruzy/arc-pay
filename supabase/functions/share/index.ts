import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const CRAWLER_UA = /bot|crawl|spider|facebookexternalhit|Twitterbot|TelegramBot|Slackbot|LinkedInBot|Discordbot|WhatsApp|Googlebot/i
const APP_ORIGIN = Deno.env.get('APP_ORIGIN') || ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const OG_IMAGE_URL = `${SUPABASE_URL}/functions/v1/og-image`

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const to = url.searchParams.get('to') || ''
  const amount = url.searchParams.get('amount') || '0'
  const ua = req.headers.get('user-agent') || ''

  const spaUrl = `${APP_ORIGIN}/pay?to=${encodeURIComponent(to)}&amount=${encodeURIComponent(amount)}`
  const ogImageUrl = `${OG_IMAGE_URL}?amount=${encodeURIComponent(amount)}&to=${encodeURIComponent(to)}`
  const displayAmount = parseFloat(amount).toFixed(2)
  const shortAddr = to ? `${to.slice(0, 6)}...${to.slice(-4)}` : ''

  if (!CRAWLER_UA.test(ua)) {
    return new Response(null, {
      status: 302,
      headers: { ...corsHeaders, Location: spaUrl },
    })
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pay ${displayAmount} USDC | Arc Pay-Link</title>
  <meta name="description" content="Payment request for ${displayAmount} USDC to ${shortAddr} on Arc Testnet" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Pay ${displayAmount} USDC on Arc" />
  <meta property="og:description" content="Send ${displayAmount} USDC to ${shortAddr} on Arc Testnet" />
  <meta property="og:image" content="${ogImageUrl}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content="${spaUrl}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Pay ${displayAmount} USDC on Arc" />
  <meta name="twitter:description" content="Send ${displayAmount} USDC to ${shortAddr} on Arc Testnet" />
  <meta name="twitter:image" content="${ogImageUrl}" />
  <link rel="canonical" href="${spaUrl}" />
</head>
<body>
  <p>Redirecting to payment page...</p>
  <script>window.location.href="${spaUrl}";</script>
</body>
</html>`

  return new Response(html, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
})
