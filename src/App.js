import React, {useContext, useEffect, useState} from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';

import Sign from './pages/Sign/Sign';
import SignIn from './pages/Sign/SignIn';
import SignUp from './pages/Sign/SignUp';
import Loading from './pages/Sign/Loading';
import Main from './pages/Main/Main';
import Promotion from './pages/Promotion/Promotion';
import Logout from "./pages/Logout/Logout";
import AiSearch from "./pages/Search/AiSearch";
import AiSimpleSearch from "./pages/Search/AiSimpleSearch";
import FindId from './pages/Sign/FindId';
import FindPw from './pages/Sign/FindPw';
import Inven from './pages/Inven/Inven';
import Excel from './pages/Inven/Excel';
import Profile from "./pages/Profile/Profile";
import Demo from "./pages/Demo";
import Navigation from "./components/Nav/Navigation";
import MyPage from "./pages/MyPage/MyPage";
import AiDetailSearch from "./pages/Search/AiDetailSearch";
import HistoryList from './pages/History/HistoryList';
import HistoryDetail from './pages/History/HistoryDetail';
import LikeList from './pages/Like/LikeList';
import LikeDetail from './pages/Like/LikeDetail';
import ManagementLogin from './pages/Management/ManagementLogin';
import ManagementNav from "./pages/Management/ManagementNav";
import ManagementDashboard from "./pages/Management/ManagementDashboard";
import ManagementUser from "./pages/Management/ManagementUser";
import ManagementInquiry from "./pages/Management/ManagementInquiry";
import ManagementComunity from "./pages/Management/ManagementComunity";
import ManagementSearch from "./pages/Management/ManagementSearch";
import ManagementReport from "./pages/Management/ManagementReport";
import ManagementLayout from "./pages/Management/ManagementLayout";
import PrivateRouteAdmin from "./services/Management/PrivateRouteAdmin"
import PrivateRoute  from "./services/PrivateRoute";
import Gallery from "./pages/Gallery/Gallery.jsx";
import Mainc from "./pages/Main/Main copy.jsx";

// import index from '../src/styles/index.css'


import 'bootstrap/dist/css/bootstrap.min.css';
import {useDispatch, useSelector} from "react-redux";


function App() {
  console.log("this is app");


  return (

    <div className="App">
      <Router>
        <Routes>
          <Route path="/nav" element={<Navigation/>}/>
          <Route path="/Sign" element={<Sign />} />
          <Route path="/SignIn" element={<SignIn />} />
          <Route path="/SignUp" element={<SignUp />} />
          <Route path="/Loading" element={<Loading />} />
          <Route path="/Main" element={<PrivateRoute component={<Mainc />} />} />
          <Route path="/Promotion" element={<Promotion />} />
          <Route path="/Logout" element={<Logout/>}/>
          <Route path="/AiSearch" element={<PrivateRoute component={<AiSearch />}/>} />
          <Route path="/AiSimpleSearch" element={<PrivateRoute component={<AiSimpleSearch />} />} />
          <Route path="/AiDetailSearch" element={<PrivateRoute component={<AiDetailSearch />} />} />
          <Route path="/FindId" element={<FindId />} />
          <Route path="/FindPw" element={<FindPw />} />
          <Route path="/Inven" element={<PrivateRoute component={<Inven />}/>} />
          <Route path="/Excel" element={<PrivateRoute component={<Excel />}/>} />
          <Route path="/ProFile" element={<PrivateRoute component={<Profile/>} />} />
          <Route path="/MyPage" element={<PrivateRoute component={<MyPage/>}/>}/>
          {/*<Route path="/MyPage" element={<MyPage/>}/>*/}
          <Route path="/HistoryList" element={<PrivateRoute component={<HistoryList />}/>}/>
          <Route path="/HistoryDetail" element={<PrivateRoute component={<HistoryDetail />}/>}/>
          <Route path="/LikeList" element={<PrivateRoute component={<LikeList />}/>}/>
          <Route path="/LikeDetail" element={<PrivateRoute component={<LikeDetail />}/>}/>


          {/* Management Pages*/}
          <Route path="/Management/*" element={<ManagementLogin/>}/>
          {/*<Route path="/Management/Dashboard" element={<ManagementLayout><ManagementDashboard /></ManagementLayout>} />*/}
          <Route path="/Management/Dashboard" element={<PrivateRouteAdmin
            component={<ManagementLayout><ManagementDashboard /></ManagementLayout>} />}
          />
          <Route path="/Management/User" element={<PrivateRouteAdmin
            component={<ManagementLayout><ManagementUser /></ManagementLayout>} />}
          />
          <Route path="/Management/Inquiry" element={<PrivateRouteAdmin
            component={<ManagementLayout><ManagementInquiry /></ManagementLayout>} />}
          />
          <Route path="/Management/Comunity" element={<PrivateRouteAdmin
            component={<ManagementLayout><ManagementComunity /></ManagementLayout>} />}
          />
          <Route path="/Management/Report" element={<PrivateRouteAdmin
            component={<ManagementLayout><ManagementReport /></ManagementLayout>} />}
          />

          <Route path="/Management/Search" element={<PrivateRouteAdmin
              component={<ManagementLayout><ManagementSearch /></ManagementLayout>} />}
          />

          <Route path="/Demo" element={<Demo/>}/>
          <Route path="/Gallery" element={<Gallery/>} />

        </Routes>
      </Router>
      
    </div>

  );
}


export default App;
