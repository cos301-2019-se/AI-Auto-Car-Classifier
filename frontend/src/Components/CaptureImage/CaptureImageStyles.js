const styles = theme => ({
    appBar: {
        position: 'relative',
    },
    layout: {
        width: 'auto',
        marginLeft: theme.spacing.unit * 2,
        marginRight: theme.spacing.unit * 2,
        [theme.breakpoints.up(600 + theme.spacing.unit * 2 * 2)]: {
            width: 600,
            marginLeft: 'auto',
            marginRight: 'auto',
        },
    },
    paper: {
        marginTop: theme.spacing.unit * 3,
        marginBottom: theme.spacing.unit * 3,
        padding: theme.spacing.unit * 2,
        [theme.breakpoints.up(600 + theme.spacing.unit * 3 * 2)]: {
            marginTop: theme.spacing.unit * 6,
            marginBottom: theme.spacing.unit * 6,
            padding: theme.spacing.unit * 3,
        },
    },
    buttons: {
        marginTop: '5%',
        marginRight: '1.5em',
        width: '1.5em'
    },
    buttons2: {
        marginTop: '5%',
        width: '1.5em'
    },
    buttons3: {
        marginTop: '5%',
        marginLeft: '1.5em',
        width: '1.5em'
    },
    button: {
        marginTop: theme.spacing.unit * 3,
    },
    cloudIcon: {
        marginLeft: '0.3em'
    },
    textBelowImage: {
        marginTop: '5%'
    },
    carSuccess: {
        width: '3em',
        marginTop: '1em'
    },
    image: {
        marginTop: '1em',
        maxWidth: '100%',
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    progress: {
        marginTop: '1em'
    },
    input: {
        display: 'none'
    },
    card: {
        maxWidth: 400,
    },
    media: {
        height: 0,
        paddingTop: '56.25%', // 16:9
    },
    actions: {
        display: 'flex',
    },
    expand: {
        transform: 'rotate(0deg)',
        marginLeft: 'auto',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    },
    expandOpen: {
        transform: 'rotate(180deg)',
    },
    avatar: {
        backgroundColor: '#000000',
    },
});

export default styles;