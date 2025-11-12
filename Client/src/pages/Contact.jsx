const Contact = () => (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Contact Us</h1>
        <p className="text-gray-600 text-lg">
            Feel free to reach out to us with any questions or inquiries.
        </p>
        <div className="p-6 bg-blue-50 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <p className="mb-2">
                <span className="font-medium">Email:</span> info@hilalportal.com
            </p>
            <p className="mb-2">
                <span className="font-medium">Phone:</span> +1 (555) 123-4567
            </p>
            <p>
                <span className="font-medium">Address:</span> 123 Portal Street, Suite 100, City, Country
            </p>
        </div>
    </div>
);

export default Contact;
