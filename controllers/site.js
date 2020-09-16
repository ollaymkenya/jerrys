exports.getIndex = (req, res, next) => {
    res.render('site/index', {
        title: 'JTT',
        path: '/'
    });
}

exports.getAbout = (req, res, next) => {
    res.render('site/about', {
        title: 'About Me',
        path: '/about'
    });
}

exports.getContacts = (req, res, next) => {
    res.render('site/contacts', {
        title: 'Contact Me',
        path: '/contacts'
    });
}

exports.getSamples = (req, res, next) => {
    res.render('site/samples', {
        title: 'Samples',
        path: '/samples'
    });
}

exports.getFAQ = (req, res, next) => {
    res.render('site/faq', {
        title: 'F.A.Q',
        path: '/faq'
    });
}

exports.getSales = (req, res, next) => {
    res.render('site/sales', {
        title: 'Write My Paper',
        path: '/sales'
    });
}
