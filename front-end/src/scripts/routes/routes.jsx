import AboutPage from "../pages/about/about-page.jsx";
import AnalisisPage from "../pages/analisis/analisis.jsx";
import ArtikelDetailPage from "../pages/artikel/artikel-detail.jsx";
import ArtikelPage from "../pages/artikel/artikel.jsx";
import LoginPage from "../pages/auth/login.jsx";
import RegisterPage from "../pages/auth/register.jsx";
import HistoryPage from "../pages/history/history.jsx";
import HomePage from "../pages/home/home-page.jsx";
import NotifikasiPage from "../pages/notifikasi/notifikasi.jsx";
import ProdukPage from "../pages/produk/produk.jsx";
import TestAuth from "../pages/test-auth.jsx";

const routes = {
  "/": HomePage,
  "/about": AboutPage,
  "/analisis": AnalisisPage,
  "/artikel": ArtikelPage,
  "/artikel/:id": ArtikelDetailPage,
  "/notifikasi": NotifikasiPage,
  "/produk": ProdukPage,
  "/riwayat": HistoryPage,
  "/login": LoginPage,
  "/register": RegisterPage,
  "/test-auth": TestAuth,
};

export default routes;
