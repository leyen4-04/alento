import { NavLink } from "react-router-dom";
import "../../style/components/BottomNav.css";
import { FaCalendarAlt } from "react-icons/fa";
import { IoHome } from "react-icons/io5";
import { FaUserAlt } from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";
import { FaCommentAlt } from "react-icons/fa";





function BottomNav({ userInfo }: { userInfo?: any }) {
  return (
    <nav className="bottom-nav">

      <NavLink to="/history" className="nav-item">
        <span className="nav-icon"><FaCommentAlt /></span>
        <span className="nav-text">지난 기록</span>
      </NavLink>

      <NavLink to="/calendar" className="nav-item">
        <span className="nav-icon"><FaCalendarAlt /></span>
        <span className="nav-text">캘린더</span>
      </NavLink>

      <NavLink to="/" className="nav-item">
        <span className="nav-icon"><IoHome /></span>
        <span className="nav-text">메인</span>
      </NavLink>

      <NavLink to="/manage" className="nav-item">
        <span className="nav-icon"><IoSettingsSharp /></span>
        <span className="nav-text">기기 관리</span>
      </NavLink>

      <NavLink to="/user" className="nav-item">
        <span className="nav-icon"><FaUserAlt /></span>
        <span className="nav-text">
        {userInfo ? userInfo.full_name : "사용자"}
        </span>
      </NavLink>

    </nav>
  );
}

export default BottomNav;