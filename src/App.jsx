import Home from './Pages/customer/Home/Home'
import Login from './Pages/customer/Login/Login'
import Register from './Pages/customer/Register/Register'
import ModeratorDashboard from './Pages/moderator/ModeratorDashboard';
import AdminDashboard from './Pages/administrator/AdminDashboard';
import OwnerDashboard from './Pages/cams_owner/OwnerDashboard';
import About_Sarawak from './Pages/customer/About_Sarawak/about_sarawak';
import Product from './Pages/customer/Product/product';
import PropertyDetails from './Pages/customer/PropertyDetails/PropertyDetails';
import Cart from './Pages/customer/Cart/cart';
import About_Us from './Pages/customer/About_Us/About_Us';
import NoAccess from './Component/NoAccess/NoAccess';
import Error from './Component/Error_404/Error';
import Profile from './Pages/customer/Profile/Profile';

//Import React router dom

import{
  createBrowserRouter,
  RouterProvider
}from 'react-router-dom'

const router = createBrowserRouter([
   {
     path: '/',
     element: <div><Home/></div>
   },

   {
     path: '/register',
     element: <div><Register/></div>
   },

   {
     path: '/login',
     element: <div><Login/></div>
   },

   //Customer
   {
    path: '/home',  
    element: <Home/>
   },

   {
    path: '/about_sarawak', 
    element: <About_Sarawak/>
   },

   {
    path: '/product', 
    element: <Product/>
   },

   {
    path: '/product/:propertyID', 
    element: <div><PropertyDetails/></div>
   },

   {
    path: '/cart', 
    element: <Cart/>
   },
   
   {
    path: '/about_us', 
    element: <About_Us/>
   },

   {
     path: '/login/home',
     element: <div><Home/></div>
   },

   {
     path: '/login/about_sarawak',
     element: <div><About_Sarawak/></div>
   },

   {
     path: '/login/product',
     element: <div><Product/></div>
   },

   {
    path: '/login/product/:propertyID', 
    element: <div><PropertyDetails/></div>
   },

   {
    path: '/login/cart',
    element: <div><Cart/></div>
   },

   {
    path: '/login/about_us',
    element: <div><About_Us/></div>
   },

   {
    path: '/login/profile',
    element: <div><Profile/></div>
   },

    //Administrator
    {
      path: '/login/administrator_dashboard/*',
      element: <div><AdminDashboard/></div>
    },

     //Moderator
     {
      path: '/login/moderator_dashboard/*',
      element: <div><ModeratorDashboard/></div>
    },

   //Owner
    {
     path: '/login/owner_dashboard/*',
     element: <div><OwnerDashboard/></div>
   },

   // No Access
   {
    path: '/no-access',
    element: <div><NoAccess/></div>
   },

   // Error 404
  {
    path: '*', 
    element: <div><Error /></div>
  }
])

function App() {

  return (
  <div>
    <RouterProvider router={router}/>
  </div>
  )
}

export default App