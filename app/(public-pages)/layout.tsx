import React from 'react';
import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';
import LenisScroll from '@/components/lenis-scroll';


export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <LenisScroll />
            <Navbar />
            {children}
            <Footer />
        </>
    );
}
