import { Link } from 'react-router-dom';

export default function NotFoundPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 text-center">
            <div className="space-y-4">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">404</h1>
                <p className="text-xl text-gray-600">Page not found</p>
                <div className="pt-4">
                    <Link to="/students" className="text-base font-medium text-blue-600 hover:text-blue-500">
                        Return to Preview &rarr;
                    </Link>
                </div>
            </div>
        </div>
    );
}
