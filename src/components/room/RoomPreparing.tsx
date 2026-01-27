'use client';

import { motion } from 'framer-motion';
import { Construction, Sparkles, Rocket } from 'lucide-react';

export default function RoomPreparing() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                    duration: 0.8,
                    ease: [0, 0.71, 0.2, 1.01]
                }}
                className="relative mb-12"
            >
                <div className="absolute -inset-4 bg-tesla-red/10 blur-3xl rounded-full" />
                <motion.div
                    animate={{
                        rotate: [0, 10, -10, 0],
                        y: [0, -10, 0]
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <Construction className="h-24 w-24 text-tesla-red relative z-10" />
                </motion.div>
                <motion.div
                    animate={{
                        opacity: [0.2, 1, 0.2],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute -top-4 -right-4"
                >
                    <Sparkles className="h-8 w-8 text-tesla-red" />
                </motion.div>
                <motion.div
                    animate={{
                        opacity: [0.2, 1, 0.2],
                        scale: [1, 1.5, 1]
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5
                    }}
                    className="absolute -bottom-2 -left-6"
                >
                    <Rocket className="h-6 w-6 text-tesla-red/40" />
                </motion.div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-6 uppercase">
                    Coming <span className="text-tesla-red">Soon</span>
                </h1>
                <p className="text-foreground/60 text-xl max-w-2xl mx-auto leading-relaxed">
                    더욱 스마트하고 멋진 서비스를 위해 <br className="hidden md:block" />
                    <span className="font-bold text-foreground">Room 기능</span>을 준비하고 있습니다. 조금만 기다려주세요!
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-12 flex gap-4"
            >
                <div className="h-1.5 w-40 rounded-full bg-tesla-red/10 overflow-hidden">
                    <motion.div
                        className="h-full bg-tesla-red w-full"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                </div>
            </motion.div>
        </div>
    );
}
