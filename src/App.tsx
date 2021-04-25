import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import {
    ThemeProvider,
    Container,
    AppBar,
    Button,
    IconButton,
    Toolbar,
    Typography,
    Box,
} from '@material-ui/core';
import { createMuiTheme, styled, useTheme } from '@material-ui/core/styles';
import { purple, green } from '@material-ui/core/colors';
import {
    QueryClient,
    QueryClientProvider,
    useQuery,
    useQueryClient,
} from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

interface User {
    id: number;
    name: string;
}

const USERS = [
    { id: 0, name: 'Alice' },
    { id: 1, name: 'Bob' },
];

const getUsers = async (): Promise<Array<User>> => {
    console.log('FETCHING ALL USERS');
    return new Promise((res) => {
        setTimeout(() => {
            res(USERS);
        }, 1000);
    });
};

const getUser = async (
    userId: number,
    queryClient: QueryClient,
): Promise<User> => {
    const usersState = queryClient.getQueryState<Array<User>>(['users']);

    // Pull from the users cache if it's not invalidated
    if (
        usersState?.status === 'success' &&
        !usersState?.isInvalidated &&
        usersState?.data !== undefined
    ) {
        console.log(`RETURNING USER ${userId} FROM CACHE`);
        return usersState.data[userId];
    }
    console.log(`FETCHING USER ${userId}`);
    return new Promise((res) => {
        setTimeout(() => {
            res(USERS[userId]);
        }, 1000);
    });
};

const UserPage: React.FC<{ userId: number }> = ({ userId }) => {
    const queryClient = useQueryClient();
    const { isLoading, data } = useQuery(['users', userId], () => {
        return getUser(userId, queryClient);
    });
    if (isLoading) {
        return <Typography variant="body1">loading</Typography>;
    }
    return (
        <>
            <Typography variant="h1">{data?.name}</Typography>
            <Link to="/users">Back</Link>
        </>
    );
};

const UserListItem: React.FC<{ user: User }> = ({ user }) => {
    return (
        <>
            <Typography variant="h3">{user.name}</Typography>
            <Link to={`/users/${user.id}`}>View</Link>
        </>
    );
};

const UserList: React.FC = () => {
    const { isLoading, data, isError } = useQuery(['users'], getUsers);
    if (isLoading) {
        return <Typography variant="body1">Loading</Typography>;
    }
    if (isError) {
        return <Typography variant="body2">Error</Typography>;
    }
    const userListItems = data?.map((user) => {
        return <UserListItem user={user} key={user.id} />;
    });
    return <>{userListItems}</>;
};

const UsersPage: React.FC = () => {
    return (
        <>
            <Typography variant="h1">Users</Typography>
            <Link to="/">Go Home</Link>
            <UserList />
        </>
    );
};

const HomePage: React.FC = () => {
    return (
        <>
            <Typography variant="h1">Home</Typography>
            <Link to="/users">Users</Link>
        </>
    );
};

const Navbar: React.FC = () => {
    return (
        <AppBar position="static">
            <Toolbar>
                <IconButton edge="start" color="inherit" aria-label="menu">
                    ...
                </IconButton>
                <Typography variant="h6">News</Typography>
                <Button color="inherit">Login</Button>
            </Toolbar>
        </AppBar>
    );
};

const Routes: React.FC = () => {
    return (
        <Switch>
            <Route
                path="/users/:id"
                render={({ match }) => {
                    return <UserPage userId={parseInt(match.params.id)} />;
                }}
            />
            <Route path="/users">
                <UsersPage />
            </Route>
            <Route path="/">
                <HomePage />
            </Route>
        </Switch>
    );
};

const ThemeWrapper: React.FC = ({ children }) => {
    const theme = createMuiTheme({
        // https://material-ui.com/customization/palette/
        palette: {
            type: 'dark',
            primary: {
                main: purple[500],
            },
            secondary: {
                main: green[500],
            },
        },
    });

    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

const Viewport: React.FC = ({ children }) => {
    const theme = useTheme();
    const StyledBox = styled(Box)({
        background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.secondary.light} 90%)`,
        height: '100vh',
        width: '100vw',
    });
    return <StyledBox>{children}</StyledBox>;
};

const ContentWrapper: React.FC = ({ children }) => {
    return (
        <Container>
            <>{children}</>
        </Container>
    );
};

const QueryProviderWrapper: React.FC = ({ children }) => {
    const client = new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 5, // Time in MS until query results are marked stale
                cacheTime: 1000 * 60 * 30, // Time in MS until query results are deleted
            },
        },
    });
    return (
        <QueryClientProvider client={client}>
            <ReactQueryDevtools initialIsOpen={false} />
            <>{children}</>
        </QueryClientProvider>
    );
};

const App: React.FC = () => {
    return (
        <QueryProviderWrapper>
            <Router>
                <ThemeWrapper>
                    <Viewport>
                        <Navbar />
                        <ContentWrapper>
                            <Routes />
                        </ContentWrapper>
                    </Viewport>
                </ThemeWrapper>
            </Router>
        </QueryProviderWrapper>
    );
};

export default App;
