import React, { useState } from 'react';

const NewsLetter = () => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Submitted email:', email);
        setEmail('');
    };

    return (
        <div className="bg-white px-4 font-poppins">
            <div className="border-t-[3px] border-red-600">
                <div className="py-2 mb-1">
                    <h2 className="heading-text-primary">Get Newsletter</h2>
                </div>
                <div className="p-4 flex flex-col gap-y-8">
                    <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                        Subscribe to our newsletter to get latest news, popular news and exclusive updates.
                    </p>
                    <form onSubmit={handleSubmit} className="flex w-full max-w-md">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="E-mail address"
                            className="w-full px-3 py-2 border border-gray-300 bg-gray-100  text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            required
                        />
                        <button
                            type="submit"
                            className="bg-red-600 text-white px-4 py-2  hover:bg-red-700 transition-colors duration-200 flex items-center justify-center flex-shrink-0"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                />
                            </svg>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NewsLetter;
