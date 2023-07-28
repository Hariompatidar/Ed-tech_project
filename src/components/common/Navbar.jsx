import React, { useEffect, useState } from 'react'
import { Link, matchPath } from 'react-router-dom'
import logo from '../../assets/Logo/Logo-Full-Light.png'
import {NavbarLinks} from '../../data/navbar-links'
import { useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {AiOutlineShoppingCart} from 'react-icons/ai'
import ProfileDropDown from '../core/Auth/ProfileDropDown'
import { apiConnector } from '../../services/apiconnector'
import { categories } from '../../services/apis'
import {BsChevronDown} from "react-icons/bs"

const subLinks=[
    {
        title:"Python",
        link:"/catalog/python"
    },
    {
        title:"Web development",
        link:"/catalog/web-development"
    }
]

const Navbar = () => {
    const {token}= useSelector((state)=>state.auth)
    const {user}= useSelector((state)=>state.profile)
    const {totalItems}= useSelector((state)=>state.cart)
    const location= useLocation();

    // const [ssubLinks, setSsubLinks]= useState([]);

    // const fetchSublinks=async()=>{
    //     try {
    //         const result=await apiConnector("GET", categories.CATEGORIES_API);
    //         console.log("Printing Sublink result", result);
    //         setSsubLinks(result.data.data);
    //     } catch (error) {
    //         console.log("Could not fetch the category list");
    //     }
    // }

    // useEffect(()=>{
    //     fetchSublinks();
    // },[])

    const matchRoute=(route)=>{
        return matchPath ({path:route}, location.pathname)
    }
  return (
    <div className='flex h-14 items-center justify-center border-b-[1px] border-b-richblack-700'>
        <div className='flex w-11/12 max-w-maxContent items-center justify-between'>

            {/* Image of logo  */}
            <Link to="/">
                <img src={logo} alt='StudyNotion' loading='lazy' width={160} height={42}/>
            </Link>

            {/* Nav Links  */}
            <nav>
                <ul className='flex gap-x-6 text-richblack-25'>
                    {
                        NavbarLinks.map((link, index)=>(
                            <li key={index}>
                                    {
                                        link.title==="Catalog"
                                         ?(
                                            <div className='relative flex items-center gap-2 group'>
                                                <p>{link.title}</p>
                                                <BsChevronDown />

                                                <div  className="invisible absolute left-[50%] top-[50%] flex w-[200px] translate-x-[-50%] translate-y-[3em] flex-col rounded-lg bg-richblack-5 p-4 text-richblack-900 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-[1.65em] group-hover:opacity-100 lg:w-[300px]">
                                                <div className="absolute left-[50%] top-0 -z-10 h-6 w-6 translate-x-[80%] translate-y-[-40%] rotate-45 se rounded bg-richblack-5"></div>

                                                    {
                                                        subLinks.length? (
                                                                subLinks.map((subLink,index)=>{
                                                                    <Link to={`${subLink.link}`} key={index} className='text-black'>
                                                                        <p>{subLink.title}</p>
                                                                        <p>Hello</p>
                                                                    </Link>
                                                                })
                                                            
                                                        ):(<div className='text-black'>Empty</div>)
                                                    }
                                                </div>
                                            </div>
                                         ):(
                                            <Link to={link?.path}>
                                                <p className={`${matchRoute(link?.path)? "text-yellow-25" : "text-richblack-25"}`}>
                                                    {link.title}
                                                </p>
                                            </Link>
                                            )
                                    }
                            </li>
                        ))
                    }
                </ul>
            </nav>

             {/* Login/ sugnup/ dashboard */}
             <div className='flex gap-x-4 items-center'>
                    {
                        user && user?.accountType !=="Instructor" && (
                            <Link type='/dashboard/cart' className='relative'>
                                <AiOutlineShoppingCart className="text-2xl text-richblack-100" />
                                {
                                    totalItems>0 && (
                                        <span className="absolute -bottom-2 -right-2 grid h-5 w-5 place-items-center overflow-hidden rounded-full bg-richblack-600 text-center text-xs font-bold text-yellow-100">
                                            {totalItems}
                                        </span>
                                    )
                                }
                            </Link>
                        )
                    }
                    {
                        token === null && (
                            <Link to="/login">
                                <button className='border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100 rounded-md'>
                                    Log in
                                </button>
                            </Link>
                        )
                    }
                    {
                        token === null && (
                            <Link to="/signup">
                                <button className='border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100 rounded-md'>
                                    Sign up
                                </button>
                            </Link>
                        )
                    }
                    {
                        token !== null && <ProfileDropDown/>
                    }
             </div>
        </div>
    </div>
  )
}

export default Navbar