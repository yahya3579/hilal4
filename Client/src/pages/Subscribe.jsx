import React, { useState } from 'react';
import { FaEnvelope, FaUser, FaPhone, FaMapMarkerAlt, FaCheckCircle } from 'react-icons/fa';

const Subscribe = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        subscriptionType: 'monthly'
    });

    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would typically send the data to your backend
        console.log('Subscription data:', formData);
        setIsSubmitted(true);
        
        // Reset form after 3 seconds
        setTimeout(() => {
            setIsSubmitted(false);
            setFormData({
                name: '',
                email: '',
                phone: '',
                address: '',
                subscriptionType: 'monthly'
            });
        }, 3000);
    };

    const subscriptionPlans = [
        {
            id: 'monthly',
            name: 'Monthly Subscription',
            price: 'Rs. 500',
            period: 'per month',
            features: ['Digital Access', 'All Magazine Issues', 'Mobile App Access', 'Email Notifications']
        },
        {
            id: 'yearly',
            name: 'Yearly Subscription',
            price: 'Rs. 5,000',
            period: 'per year',
            features: ['Digital Access', 'All Magazine Issues', 'Mobile App Access', 'Email Notifications', 'Special Discounts', 'Priority Support']
        }
    ];

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                    <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Subscription Successful!</h2>
                    <p className="text-gray-600 mb-4">Thank you for subscribing to Hilal Publications. You will receive a confirmation email shortly.</p>
                    <p className="text-sm text-gray-500">Redirecting to home page...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-[#DF1600] to-red-700 text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Subscribe to Hilal Publications</h1>
                    <p className="text-xl md:text-2xl text-red-100">Stay updated with the latest insights and stories</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Subscription Plans */}
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Choose Your Plan</h2>
                        <div className="space-y-6">
                            {subscriptionPlans.map((plan) => (
                                <div
                                    key={plan.id}
                                    className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 ${
                                        formData.subscriptionType === plan.id
                                            ? 'border-[#DF1600] bg-red-50 shadow-lg'
                                            : 'border-gray-200 hover:border-red-300 hover:shadow-md'
                                    }`}
                                    onClick={() => setFormData(prev => ({ ...prev, subscriptionType: plan.id }))}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-[#DF1600]">{plan.price}</div>
                                            <div className="text-sm text-gray-600">{plan.period}</div>
                                        </div>
                                    </div>
                                    <ul className="space-y-2">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-center text-gray-700">
                                                <FaCheckCircle className="text-green-500 mr-2 flex-shrink-0" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Subscription Form */}
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Subscription Form</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FaUser className="inline mr-2" />
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DF1600] focus:border-transparent transition-all duration-200"
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FaEnvelope className="inline mr-2" />
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DF1600] focus:border-transparent transition-all duration-200"
                                    placeholder="Enter your email address"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FaPhone className="inline mr-2" />
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DF1600] focus:border-transparent transition-all duration-200"
                                    placeholder="Enter your phone number"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FaMapMarkerAlt className="inline mr-2" />
                                    Address
                                </label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    required
                                    rows="3"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DF1600] focus:border-transparent transition-all duration-200 resize-none"
                                    placeholder="Enter your complete address"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-[#DF1600] to-red-700 text-white font-bold py-4 px-6 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                            >
                                Subscribe Now
                            </button>
                        </form>

                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-semibold text-gray-800 mb-2">What happens next?</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• You'll receive a confirmation email</li>
                                <li>• Access to digital content will be activated</li>
                                <li>• Download our mobile app for better experience</li>
                                <li>• Get notified about new issues and articles</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Need Help?</h2>
                    <div className="grid md:grid-cols-3 gap-6 text-center">
                        <div>
                            <FaEnvelope className="text-[#DF1600] text-2xl mx-auto mb-2" />
                            <h3 className="font-semibold text-gray-800">Email Support</h3>
                            <p className="text-gray-600">hilalengish@gmail.com</p>
                        </div>
                        <div>
                            <FaPhone className="text-[#DF1600] text-2xl mx-auto mb-2" />
                            <h3 className="font-semibold text-gray-800">Phone Support</h3>
                            <p className="text-gray-600">051-5104118</p>
                        </div>
                        <div>
                            <FaMapMarkerAlt className="text-[#DF1600] text-2xl mx-auto mb-2" />
                            <h3 className="font-semibold text-gray-800">Office Address</h3>
                            <p className="text-gray-600">Hilal Road, Rawalpindi, PK</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Subscribe;
