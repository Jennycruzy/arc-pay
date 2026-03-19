import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Web3Provider } from '@/components/Web3Provider'
import CreatePage from '@/pages/CreatePage'
import PayPage from '@/pages/PayPage'
import NotFound from '@/pages/NotFound'
import ReceiptPage from '@/pages/ReceiptPage'
import DashboardLinksPage from '@/pages/DashboardLinksPage'

const App = () => (
  <Web3Provider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CreatePage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/pay" element={<PayPage />} />
        <Route path="/receipt/:id" element={<ReceiptPage />} />
        <Route path="/dashboard/links" element={<DashboardLinksPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </Web3Provider>
)

export default App
