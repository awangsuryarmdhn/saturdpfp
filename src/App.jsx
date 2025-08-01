import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Icons (Using Lucide-React for a modern look) ---
const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-yellow-300">
        <path d="M9 13.5V3l3 3m0 0 3-3V13.5M12 21v-7.5l-3-3m0 0-3 3V21M3 9h10.5l-3-3m0 0 3 3H21" />
    </svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-3-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

const DiceIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-yellow-300">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <path d="M16 8h.01"></path>
        <path d="M16 16h.01"></path>
        <path d="M8 8h.01"></path>
        <path d="M8 16h.01"></path>
        <path d="M12 12h.01"></path>
    </svg>
);

const SpinnerIcon = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const JupLogo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M8 12L8 4L16 4L16 12L12 16L8 12Z" fill="white"/>
        <path d="M12 16L16 20L8 20L12 16Z" fill="white"/>
    </svg>
);

// --- Main Application Component ---
export default function App() {
    const [prompt, setPrompt] = useState('a cute kitten');
    const [generatedImage, setGeneratedImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [statusMessage, setStatusMessage] = useState('');

    const tokenAddress = "AxJvMQKoFX1aPU8iSrKVYn8iTNZjrhAQDsDAnBWUjups";
    const jupLink = "https://jup.ag/tokens/AxJvMQKoFX1aPU8iSrKVYn8iTNZjrhAQDsDAnBWUjups";

    // List of random prompts for the new "Surprise Me!" button
    const randomPrompts = [
        'a fierce dragon',
        'a curious robot',
        'a cute alien dog',
        'a neon jellyfish',
        'an ancient cosmic tree',
        'a swirling galaxy inside a bottle',
        'a friendly ghost',
        'a disco ball',
        'a retro TV with static on the screen',
        'a floating crystal skull',
        'a wizard owl',
        'a futuristic cybernetic fox',
        'a pixelated astronaut',
        'a vaporwave-style dolphin',
        'a sentient plant in a pot',
        'a low-poly ghost'
    ];
    
    // Unified prompt modifier for consistent results.
    const pfpPromptModifier = 'vector art, full body shot, cute kawaii character with a **[head_description]** head, wearing a space suit, standing, facing forward. homogeneous and non-goofy proportions, smiling face, soft lighting, vibrant green and blue nebula background, detailed and clean lines, high quality, trending on artstation';

    // Function to call the image generation API
    const generateImage = async (inputPrompt) => {
        if (!inputPrompt) {
            setError('Please enter a description for the character\'s head.');
            return;
        }

        setIsLoading(true);
        setError('');
        setGeneratedImage(null);
        setStatusMessage("Spawning a new vibe... this might take a moment.");

        // Construct the full prompt by replacing the placeholder
        const fullPrompt = pfpPromptModifier.replace('[head_description]', inputPrompt);
        
        console.log("Sending prompt to backend:", fullPrompt);

        try {
            // Call the new backend endpoint instead of the Gemini API directly
            const response = await fetch('/api/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: fullPrompt })
            });

            if (!response.ok) {
                const errorBody = await response.json();
                throw new Error(`Failed to create image: ${errorBody.error || 'Unknown error'}`);
            }

            const result = await response.json();
            const base64Data = result.base64Data;

            if (base64Data) {
                const imageUrl = `data:image/png;base64,${base64Data}`;
                setGeneratedImage(imageUrl);
                setStatusMessage("Your unique vibe has been generated!");
            } else {
                console.error("Invalid API response:", result);
                throw new Error('API response did not contain a valid image.');
            }

        } catch (err) {
            setError(err.message || 'An unknown error occurred.');
            console.error(err);
            setStatusMessage('');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (!generatedImage) return;
        const link = document.createElement('a');
        link.href = generatedImage;
        link.download = `genz-ai-pfp.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleRandomGenerate = () => {
        const randomIndex = Math.floor(Math.random() * randomPrompts.length);
        const randomPrompt = randomPrompts[randomIndex];
        setPrompt(randomPrompt);
        generateImage(randomPrompt);
    };

    return (
        <div className="animated-cosmic-bg min-h-screen flex flex-col items-center justify-center p-4 font-inter text-white">
            <div className="w-full max-w-lg bg-slate-900/50 backdrop-blur-sm rounded-[2rem] shadow-2xl p-6 md:p-10 space-y-8 border border-cyan-700">
                
                <div className="text-center">
                    <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-cyan-400 drop-shadow-lg">
                        Saturd PFP Generator
                    </h1>
                    <p className="text-cyan-200 mt-2 text-lg">
                        Describe the head of your character.
                    </p>
                </div>

                <div className="space-y-4">
                    <label htmlFor="prompt" className="block text-sm font-semibold text-cyan-200">
                        The Head:
                    </label>
                    <textarea
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., a cute saturn planet"
                        className="w-full h-28 p-4 bg-slate-950/70 border border-cyan-700 rounded-2xl text-cyan-100 placeholder-cyan-300 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all shadow-inner"
                    />
                </div>
                
                <div className="flex flex-col md:flex-row gap-4">
                    <motion.button
                        onClick={() => generateImage(prompt)}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-600 hover:to-violet-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {isLoading ? (
                            <>
                                <SpinnerIcon />
                                <span>Spawning...</span>
                            </>
                        ) : (
                            <>
                                <SparklesIcon />
                                <span>Generate Image</span>
                            </>
                        )}
                    </motion.button>
                    <motion.button
                        onClick={handleRandomGenerate}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <DiceIcon />
                        <span>Surprise Me!</span>
                    </motion.button>
                </div>


                <div className="bg-slate-950/70 rounded-2xl p-6 min-h-[360px] flex flex-col items-center justify-center border border-cyan-700 transition-all">
                    <AnimatePresence mode="wait">
                        {isLoading && (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center text-cyan-200"
                            >
                                <SpinnerIcon />
                                <p className="mt-2 text-sm">{statusMessage}</p>
                            </motion.div>
                        )}
                        {error && (
                            <motion.p
                                key="error"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-red-400 text-center"
                            >
                                {error}
                            </motion.p>
                        )}
                        {!isLoading && !error && generatedImage && (
                            <motion.div
                                key="image"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 100 }}
                                className="space-y-6 w-full text-center"
                            >
                                <img src={generatedImage} alt="AI Generated PFP" className="rounded-2xl max-w-full h-auto mx-auto shadow-xl border-4 border-yellow-400" />
                                <motion.button
                                    onClick={handleDownload}
                                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-5 rounded-xl transition-all shadow-md"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <DownloadIcon />
                                    Download
                                </motion.button>
                            </motion.div>
                        )}
                        {!isLoading && !error && !generatedImage && (
                            <motion.p
                                key="placeholder"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-cyan-300 text-center"
                            >
                                Your masterpiece will appear here.
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>
                {statusMessage && !isLoading && (
                    <div className="text-center text-sm text-yellow-300">
                        {statusMessage}
                    </div>
                )}

                <div className="bg-slate-950/70 p-6 rounded-2xl border border-cyan-700 space-y-4">
                    <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-cyan-400">
                        $SATURD Token
                    </h2>
                    <div className="text-cyan-100 font-mono break-words bg-slate-900/50 p-3 rounded-xl border border-cyan-700">
                        {tokenAddress}
                    </div>
                    <a
                        href={jupLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-700 hover:to-indigo-600 text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg"
                    >
                        <JupLogo />
                        <span>Buy with Jup.ag</span>
                    </a>
                </div>
            </div>
        </div>
    );
}
