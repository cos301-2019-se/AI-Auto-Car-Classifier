const HUNDRED = 100;
const TWO = 2;
const THREE = 3;
const EIGHT = 8;
const FOUR = 4;
const styles = theme => ({
    main: {
        width: 'auto',
        display: 'block', // Fix IE 11 issue.
        marginLeft: theme.spacing.unit * THREE,
        marginRight: theme.spacing.unit * THREE,
        [theme.breakpoints.up(HUNDRED * FOUR + theme.spacing.unit * THREE * TWO)]: {
            width: HUNDRED * FOUR,
            marginLeft: 'auto',
            marginRight: 'auto',
        },
    },
    paper: {
        marginTop: theme.spacing.unit * EIGHT,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: `${theme.spacing.unit * THREE}px ${theme.spacing.unit * THREE}px ${theme.spacing.unit * THREE}px`,
    },
    avatar: {
        margin: theme.spacing.unit,
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing.unit,
    },
    submit: {
        marginTop: theme.spacing.unit * THREE,
    },
});

export default styles;