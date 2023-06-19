export const ROUTES = [
    {
        name: 'Home',
        route: '/',
        requireAdmin: false
    },

    {
        name: 'Courses',
        route: '/courses',
        requireAdmin: false
    },
    {
        name: 'About Us',
        route: '/about',
        requireAdmin: false
    },
    {
        name: 'Contact Us',
        route: '/contact',
        requireAdmin: false
    },

    {
        name: 'Users',
        route: '/users',
        requireAdmin: true
    },
];