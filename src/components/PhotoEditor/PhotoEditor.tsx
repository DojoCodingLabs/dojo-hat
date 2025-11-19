import React, { useState, useRef, useCallback, useEffect } from 'react';
import rightImage from '../../assets/right-dojo-hat.png';
import leftImage from '../../assets/left-dojo-hat.png';
import christmasHatImage from '../../assets/dojo-christmas-hat.png';
import dojoLogo from '../../assets/Logo-Dojo.png';
import { Position, Transform } from './types';

export const PhotoEditor: React.FC = () => {
    const [baseImage, setBaseImage] = useState<string>('');
    const [currentHatImage, setCurrentHatImage] = useState<string>(rightImage);
    const [isChristmasMode, setIsChristmasMode] = useState<boolean>(false);
    const [transform, setTransform] = useState<Transform>({
        position: { x: 0, y: 0 },
        rotation: 0,
        scale: 1,
        flipX: false,
    });
    const [originalImageSize, setOriginalImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
    const [status, setStatus] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const dragStart = useRef<Position>({ x: 0, y: 0 });
    const statusTimeoutRef = useRef<NodeJS.Timeout>();


    const handleBaseImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                showStatus('Please select an image file', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    setOriginalImageSize({ width: img.width, height: img.height });
                    showStatus('Image loaded successfully', 'success');
                };
                const dataUrl = e.target?.result as string;
                img.src = dataUrl;
                setBaseImage(dataUrl);
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const showStatus = useCallback((message: string, type: 'error' | 'success') => {
        if (statusTimeoutRef.current) {
            clearTimeout(statusTimeoutRef.current);
        }

        setStatus({ message, type });

        statusTimeoutRef.current = setTimeout(() => {
            setStatus(null);
        }, 1000);
    }, []);

    useEffect(() => {
        return () => {
            if (statusTimeoutRef.current) {
                clearTimeout(statusTimeoutRef.current);
            }
        };
    }, []);


    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        e.preventDefault();
        if (e.touches.length === 1) {
            isDragging.current = true;
            const touch = e.touches[0];
            dragStart.current = {
                x: touch.clientX - transform.position.x,
                y: touch.clientY - transform.position.y,
            };
        }
    }, [transform.position]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        e.preventDefault();
        if (isDragging.current && e.touches.length === 1) {
            const touch = e.touches[0];
            setTransform(prev => ({
                ...prev,
                position: {
                    x: touch.clientX - dragStart.current.x,
                    y: touch.clientY - dragStart.current.y,
                },
            }));
        }
    }, []);

    const handleTouchEnd = useCallback(() => {
        isDragging.current = false;
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        isDragging.current = true;
        dragStart.current = {
            x: e.clientX - transform.position.x,
            y: e.clientY - transform.position.y,
        };
    }, [transform.position]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isDragging.current) {
            setTransform(prev => ({
                ...prev,
                position: {
                    x: e.clientX - dragStart.current.x,
                    y: e.clientY - dragStart.current.y,
                },
            }));
        }
    }, []);

    const handleMouseUp = useCallback(() => {
        isDragging.current = false;
    }, []);

    const handleRotate = useCallback((direction: 'left' | 'right') => {
        setTransform(prev => ({
            ...prev,
            rotation: prev.rotation + (direction === 'left' ? -15 : 15),
        }));
    }, []);

    const handleScale = useCallback((direction: 'up' | 'down') => {
        setTransform(prev => ({
            ...prev,
            scale: Math.max(0.1, Math.min(7, prev.scale * (direction === 'up' ? 1.1 : 0.9))),
        }));
    }, []);

    const handleFlip = useCallback(() => {
        if (isChristmasMode) return; // Don't flip Christmas hat
        setCurrentHatImage(prev => prev === rightImage ? leftImage : rightImage);
    }, [isChristmasMode]);

    const handleChristmasToggle = useCallback(() => {
        const newChristmasMode = !isChristmasMode;
        setIsChristmasMode(newChristmasMode);
        if (newChristmasMode) {
            setCurrentHatImage(christmasHatImage);
        } else {
            setCurrentHatImage(rightImage);
        }
    }, [isChristmasMode]);

    const handleReset = useCallback(() => {
        setTransform({
            position: { x: 0, y: 0 },
            rotation: 0,
            scale: 1,
            flipX: false,
        });
    }, []);

    const handleSave = useCallback(async () => {
        if (!baseImage || !overlayRef.current || !containerRef.current) {
            showStatus('Please upload an image first', 'error');
            return;
        }

        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('Could not get canvas context');
            }

            const baseImg = new Image();
            baseImg.src = baseImage;
            await new Promise(resolve => baseImg.onload = resolve);

            canvas.width = originalImageSize.width;
            canvas.height = originalImageSize.height;

            ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

            const container = containerRef.current;
            const containerRect = container.getBoundingClientRect();
            const containerAspect = containerRect.width / containerRect.height;
            const imageAspect = canvas.width / canvas.height;

            let displayedWidth = containerRect.width;
            let displayedHeight = containerRect.height;
            if (containerAspect > imageAspect) {
                displayedWidth = displayedHeight * imageAspect;
            } else {
                displayedHeight = displayedWidth / imageAspect;
            }

            const scaleX = canvas.width / displayedWidth;
            const scaleY = canvas.height / displayedHeight;

            const overlayImg = overlayRef.current.querySelector('img');
            if (overlayImg) {
                const hatImg = new Image();
                hatImg.src = currentHatImage;
                await new Promise(resolve => hatImg.onload = resolve);

                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;

                ctx.save();
                ctx.translate(centerX + (transform.position.x * scaleX), centerY + (transform.position.y * scaleY));
                ctx.rotate((transform.rotation * Math.PI) / 180);
                if (transform.flipX) {
                    ctx.scale(-1, 1);
                }
                ctx.scale(transform.scale, transform.scale);

                const overlayWidth = 100 * scaleX;
                const overlayHeight = (overlayWidth * hatImg.height) / hatImg.width;
                ctx.drawImage(hatImg, -overlayWidth / 2, -overlayHeight / 2, overlayWidth, overlayHeight);

                ctx.restore();
            }

            const link = document.createElement('a');
            link.download = 'you-are-a-partner-now.png';
            link.href = canvas.toDataURL('image/png');
            link.click();

            showStatus('Image saved successfully', 'success');
        } catch (error) {
            console.error('Save error:', error);
            showStatus('Error saving image', 'error');
        }
    }, [baseImage, transform, originalImageSize, currentHatImage]);

    const getOverlayStyle = () => {
        return {
            transform: `translate(-50%, -50%) 
                       translate(${transform.position.x}px, ${transform.position.y}px)
                       rotate(${transform.rotation}deg)
                       scale(${transform.scale * (transform.flipX ? -1 : 1)}, ${transform.scale})`,
        };
    };

    return (
        <div className={`flex flex-col items-center gap-4 p-4 w-full min-h-screen font-['Space_Grotesk'] overflow-x-hidden relative ${
            isChristmasMode 
                ? 'bg-gradient-to-b from-red-50 via-white to-green-50' 
                : 'bg-white'
        }`}>
            {/* Christmas background decorations */}
            {isChristmasMode && (
                <>
                    <div className="fixed inset-0 pointer-events-none overflow-hidden">
                        {/* Snowflakes */}
                        {[...Array(30)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute text-2xl text-blue-300 opacity-60 animate-pulse"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 3}s`,
                                    animationDuration: `${3 + Math.random() * 2}s`,
                                }}
                            >
                                ❄️
                            </div>
                        ))}
                        {/* Christmas ornaments */}
                        {[...Array(15)].map((_, i) => (
                            <div
                                key={`ornament-${i}`}
                                className="absolute text-xl opacity-40"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    animation: `float ${4 + Math.random() * 2}s ease-in-out infinite`,
                                    animationDelay: `${Math.random() * 2}s`,
                                }}
                            >
                                {i % 3 === 0 ? '🎄' : i % 3 === 1 ? '🎁' : '⭐'}
                            </div>
                        ))}
                    </div>
                    <style>{`
                        @keyframes float {
                            0%, 100% { transform: translateY(0px) rotate(0deg); }
                            50% { transform: translateY(-20px) rotate(10deg); }
                        }
                    `}</style>
                </>
            )}
            
            <div className="flex flex-col items-center w-full max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-8 flex flex-col items-center gap-4">
                    <img
                        src={dojoLogo}
                        alt="Dojo Coding logo"
                        className="w-36 h-auto drop-shadow-[0_25px_45px_rgba(255,140,75,0.45)]"
                    />
                    <h1 className={`text-5xl uppercase tracking-wider font-black m-0 ${
                        isChristmasMode
                            ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-green-600 to-red-600 drop-shadow-[0_6px_20px_rgba(0,0,0,0.2)]'
                            : 'text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b2b] via-[#ff8853] to-[#ff6b2b] drop-shadow-[0_6px_20px_rgba(0,0,0,0.15)]'
                    }`}>
                        Put on your Dojo Coding hat
                    </h1>
                    <p className={`text-xl font-semibold tracking-[0.3em] mt-2 ${
                        isChristmasMode
                            ? 'text-red-700 drop-shadow-[0_4px_12px_rgba(0,0,0,0.2)]'
                            : 'text-[#ff6b2b] drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)]'
                    }`}>
                        BE A PARTNER
                    </p>
                </div>

                <div className="flex items-center gap-3 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={isChristmasMode}
                            onChange={handleChristmasToggle}
                            className="w-5 h-5 rounded border-2 border-[#ff6b2b] text-red-600 focus:ring-2 focus:ring-[#ff6b2b] focus:ring-offset-2 cursor-pointer transition-all"
                        />
                        <span className={`text-lg font-semibold flex items-center gap-2 ${
                            isChristmasMode
                                ? 'text-red-700'
                                : 'text-gray-700'
                        }`}>
                            🎄 Christmas Mode
                        </span>
                    </label>
                </div>

                <div className="w-full max-w-md">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleBaseImageUpload}
                        className="w-full p-3 border-2 border-[#ff6b2b] rounded-lg bg-white text-gray-800 cursor-pointer transition-all hover:border-[#ff8f5a] hover:bg-gray-50 shadow-md"
                    />
                </div>

                <div
                    ref={containerRef}
                    className={`relative w-full max-w-[800px] h-[600px] mx-auto mt-8 border-3 rounded-xl overflow-hidden touch-none shadow-lg ${
                        isChristmasMode
                            ? 'border-red-500 bg-gradient-to-br from-red-50 to-green-50'
                            : 'border-[#ff6b2b] bg-gray-100'
                    }`}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onTouchCancel={handleTouchEnd}
                >
                    <div className={`absolute top-4 right-4 px-4 py-2 rounded-full text-white text-sm font-semibold flex items-center gap-2 z-10 shadow-lg ${
                        isChristmasMode
                            ? 'bg-gradient-to-r from-red-600 to-green-600'
                            : 'bg-[#ff6b2b]'
                    }`}>
                        {isChristmasMode ? '🎄' : '🤖'} Dojo Coding
                    </div>

                    {baseImage && (
                        <img src={baseImage} alt="Base" className="w-full h-full object-contain" />
                    )}

                    <div
                        ref={overlayRef}
                        style={getOverlayStyle()}
                        className="absolute top-1/2 left-1/2 cursor-move touch-none filter drop-shadow-lg"
                        onMouseDown={handleMouseDown}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        <img
                            src={currentHatImage}
                            alt="Overlay"
                            className="w-[100px] h-auto select-none"
                            draggable={false}
                        />
                    </div>
                </div>

                <div className={`flex flex-wrap gap-4 justify-center p-6 rounded-xl shadow-lg mt-4 w-full max-w-[800px] ${
                    isChristmasMode ? 'bg-gradient-to-r from-red-100 to-green-100' : 'bg-gray-100'
                }`}>
                    {['⟲ Rotate Left', '⟳ Rotate Right', '+ Scale Up', '- Scale Down', '↔️ Flip', 'Reset', 'Save Image'].map((text) => {
                        const isReset = text === 'Reset';
                        const isDisabled = text === 'Save Image' && !baseImage;
                        const isFlip = text === '↔️ Flip';
                        
                        return (
                            <button
                                key={text}
                                onClick={() => {
                                    if (text === '⟲ Rotate Left') handleRotate('left');
                                    else if (text === '⟳ Rotate Right') handleRotate('right');
                                    else if (text === '+ Scale Up') handleScale('up');
                                    else if (text === '- Scale Down') handleScale('down');
                                    else if (isFlip) handleFlip();
                                    else if (isReset) handleReset();
                                    else if (text === 'Save Image') handleSave();
                                }}
                                disabled={isDisabled || (isFlip && isChristmasMode)}
                                className={`px-6 py-3 rounded-lg cursor-pointer text-base font-semibold uppercase tracking-[0.2em] transition-all hover:-translate-y-0.5 active:translate-y-0 ${
                                    isReset
                                        ? `bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 hover:shadow-[0_10px_25px_rgba(124,58,237,0.5)] ring-2 ring-purple-300 ring-offset-2`
                                        : isDisabled
                                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed transform-none opacity-60'
                                        : isFlip && isChristmasMode
                                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed transform-none opacity-60'
                                        : isChristmasMode
                                        ? 'bg-gradient-to-r from-red-500 to-green-500 text-white hover:from-red-600 hover:to-green-600 hover:shadow-[0_10px_25px_rgba(220,38,38,0.4)]'
                                        : 'bg-gradient-to-r from-[#ff783c] to-[#ff4f26] text-white hover:from-[#ff9a64] hover:to-[#ff6130] hover:shadow-[0_10px_25px_rgba(255,111,59,0.45)]'
                                }`}
                            >
                                {text}
                            </button>
                        );
                    })}
                </div>

                {status && (
                    <div
                        className={`fixed bottom-20 right-8 px-6 py-3 rounded-lg 
                    ${status.type === 'error' ? 'bg-red-500' : 'bg-green-600'}
                    text-white font-medium shadow-lg
                    transition-opacity duration-300
                    opacity-90 animate-fade-out`}
                    >
                        {status.message}
                    </div>
                )}

                <div className="fixed bottom-4 right-4 flex flex-col items-end gap-2">
                    <div className="flex items-center gap-3">
                        <a
                            href="https://x.com/Dojo_Coding"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`transition-colors ${
                                isChristmasMode
                                    ? 'text-red-700 hover:text-red-800'
                                    : 'text-[#ff6b2b] hover:text-[#ff8f5a]'
                            }`}
                            title="Follow us on X (Twitter)"
                        >
                            <svg
                                className="w-5 h-5 fill-current"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                            >
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </a>
                        <a
                            href="https://www.instagram.com/dojocoding_"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`transition-colors ${
                                isChristmasMode
                                    ? 'text-red-700 hover:text-red-800'
                                    : 'text-[#ff6b2b] hover:text-[#ff8f5a]'
                            }`}
                            title="Follow us on Instagram"
                        >
                            <svg
                                className="w-5 h-5 fill-current"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                            >
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                        </a>
                        <a
                            href="https://www.linkedin.com/company/dojo-coding/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`transition-colors ${
                                isChristmasMode
                                    ? 'text-red-700 hover:text-red-800'
                                    : 'text-[#ff6b2b] hover:text-[#ff8f5a]'
                            }`}
                            title="Follow us on LinkedIn"
                        >
                            <svg
                                className="w-5 h-5 fill-current"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                            >
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                        </a>
                    </div>
                    <span className={`text-sm ${
                        isChristmasMode
                            ? 'text-red-700'
                            : 'text-[#ff6b2b]'
                    }`}>© 2024 Dojo Coding™</span>
                </div>
            </div>
        </div>
    );
};

export default PhotoEditor;