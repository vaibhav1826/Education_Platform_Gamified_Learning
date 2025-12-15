import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Breadcrumb component for navigation
 * @param {Object} props
 * @param {Array} props.items - Array of {label, path} objects, or auto-generate from URL
 * @param {boolean} props.showHome - Whether to show home icon at start (default: true)
 */
const Breadcrumb = ({ items, showHome = true }) => {
    const location = useLocation();

    // Auto-generate breadcrumbs from path if no items provided
    const generateBreadcrumbs = () => {
        const pathSegments = location.pathname.split('/').filter(Boolean);
        const breadcrumbs = [];
        let currentPath = '';

        pathSegments.forEach((segment, index) => {
            currentPath += `/${segment}`;

            // Skip IDs (MongoDB ObjectIds are 24 chars hex)
            const isId = /^[a-f0-9]{24}$/i.test(segment);

            // Format segment name
            let label = segment
                .replace(/-/g, ' ')
                .replace(/_/g, ' ')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

            if (!isId) {
                breadcrumbs.push({
                    label,
                    path: currentPath,
                    isCurrent: index === pathSegments.length - 1
                });
            } else {
                // For IDs, use generic labels
                breadcrumbs.push({
                    label: 'Details',
                    path: currentPath,
                    isCurrent: index === pathSegments.length - 1
                });
            }
        });

        return breadcrumbs;
    };

    const breadcrumbItems = items || generateBreadcrumbs();

    if (breadcrumbItems.length === 0) return null;

    return (
        <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-2 text-sm flex-wrap">
                {showHome && (
                    <>
                        <li>
                            <Link
                                to="/"
                                className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                            >
                                <Home className="w-4 h-4" />
                                <span className="sr-only">Home</span>
                            </Link>
                        </li>
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                    </>
                )}

                {breadcrumbItems.map((item, index) => (
                    <li key={item.path} className="flex items-center gap-2">
                        {index > 0 && <ChevronRight className="w-4 h-4 text-slate-600" />}

                        {item.isCurrent || index === breadcrumbItems.length - 1 ? (
                            <span className="text-white font-medium truncate max-w-[200px]">
                                {item.label}
                            </span>
                        ) : (
                            <Link
                                to={item.path}
                                className="text-slate-400 hover:text-white transition-colors truncate max-w-[150px]"
                            >
                                {item.label}
                            </Link>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumb;
