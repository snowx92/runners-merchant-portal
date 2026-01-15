"use client";

import { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import styles from "@/styles/home/home.module.css";
import type { Banner } from "@/lib/api/types/home.types";

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

interface HeroBannerProps {
  banners: Banner[];
}

export const HeroBanner = ({ banners }: HeroBannerProps) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const swiperRef = useRef<SwiperType | null>(null);

    if (!banners || banners.length === 0) {
        return (
            <div className={styles.heroCard}>
                <div className={styles.heroContent}>
                    <h2 className={styles.heroTitle}>مرحباً بك</h2>
                    <p className={styles.heroSubtitle}>لا توجد بانرات متاحة حالياً</p>
                </div>
            </div>
        );
    }

    const handleBannerClick = (route: string) => {
        if (route) {
            window.open(route, '_blank');
        }
    };

    return (
        <>
            <Swiper
                modules={[Autoplay, Pagination]}
                spaceBetween={0}
                slidesPerView={1}
                autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                }}
                loop={banners.length > 1}
                onSwiper={(swiper) => {
                    swiperRef.current = swiper;
                }}
                onSlideChange={(swiper) => {
                    setActiveIndex(swiper.realIndex);
                }}
                style={{
                    borderRadius: '20px',
                    marginBottom: '1rem'
                }}
            >
                {banners.map((banner, index) => (
                    <SwiperSlide key={banner.id}>
                        <div
                            className={styles.heroCard}
                            onClick={() => handleBannerClick(banner.route)}
                            style={{
                                backgroundImage: `url('${banner.image}')`,
                                cursor: banner.route ? 'pointer' : 'default',
                                margin: 0
                            }}
                        >
                            {/* Gradient overlay */}
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.4))',
                                borderRadius: 'inherit',
                                pointerEvents: 'none'
                            }} />
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Custom Pagination Dots */}
            {banners.length > 1 && (
                <div className={styles.paginationDots}>
                    {banners.map((_, index) => (
                        <div
                            key={index}
                            className={`${styles.dot} ${index === activeIndex ? styles.dotActive : ''}`}
                            onClick={() => swiperRef.current?.slideToLoop(index)}
                            style={{ cursor: 'pointer' }}
                        />
                    ))}
                </div>
            )}
        </>
    );
};

interface PaginationDotsProps {
  count: number;
}

export const PaginationDots = ({ count }: PaginationDotsProps) => {
    // Deprecated: Pagination is now handled inside HeroBanner
    return null;
};
