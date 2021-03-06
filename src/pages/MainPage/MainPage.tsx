import './main-page.css';
import { useEffect } from 'react';
import {
  Autocomplete,
  Avatar,
  AvatarGroup,
  Grid,
  TextField,
} from '@mui/material';
import {
  useLazyQuery,
  useMutation,
  useQuery,
  useReactiveVar,
} from '@apollo/client';

//Components
import Loading from '../../components/Loading/Loading';
import GigsPage from '../GigsPage/GigsPage';

//Queries
import {
  QUERY_ALL_USERS,
  QUERY_GIGS_BY_GROUP_PK,
  QUERY_GROUP_BY_PK,
} from '../../constants/queries';
import { MUTATION_LINK_GROUP_USER } from '../../constants/mutations';

//Constants
import { groupIdVar, isEditorVar } from '../../constants/cache';
import { mainTextColor } from '../../constants/colors';

export default function MainPage() {
  const groupId = useReactiveVar(groupIdVar);
  const isEditor = useReactiveVar(isEditorVar);

  const [
    groupByPk,
    { loading: groupByPkLoading, error: groupByPkError, data: groupByPkData },
  ] = useLazyQuery(QUERY_GROUP_BY_PK);

  const {
    loading: allUsersLoading,
    error: allUsersError,
    data: allUsersData,
  } = useQuery(QUERY_ALL_USERS);

  const [
    linkGroupUser,
    { loading: linkGroupUserLoading, error: linkGroupUserError },
  ] = useMutation(MUTATION_LINK_GROUP_USER, {
    refetchQueries: [QUERY_GIGS_BY_GROUP_PK],
  });

  useEffect(() => {
    if (groupId) {
      groupByPk({
        variables: { groupId },
      });
    }
  }, [groupId]);

  //Conditional rendering
  if (
    groupByPkLoading ||
    !groupByPkData ||
    allUsersLoading ||
    linkGroupUserLoading
  ) {
    return <Loading />;
  }

  if (groupByPkError) {
    console.error(allUsersError);
    return <div>Error!</div>;
  }

  if (allUsersError) {
    console.error(allUsersError);
    return <div>Error!</div>;
  }

  if (linkGroupUserError) {
    console.error(linkGroupUserError);
    return <div>Error!</div>;
  }

  //Data manipulation
  const { name, groupsUsers } = groupByPkData.groups_by_pk;
  const { users } = allUsersData;

  const groupsUsersPks = groupsUsers.map((user: any) => user.user.id);

  const filteredUsers = users.filter(
    (newUser: any) => !groupsUsersPks.includes(newUser.id)
  );

  //   //Logs;
  //   console.log('users :>> ', users);
  //   console.log('groupId :>> ', groupId);
  // console.log('groupByPkData', groupByPkData);
  //   console.log('groupsUsers :>> ', groupsUsers);
  //   console.log('groupsUsersPks :>> ', groupsUsersPks);
  //   console.log('filteredUsers :>> ', filteredUsers);

  return (
    <div className="menu-container">
      {/* <Grid container> */}
      {/* <Grid item xs={12} sm={6} md={4} lg={3}> */}
      <div className="group-members-container">
        <h2>{name}</h2>
        <h5>Group members:</h5>
        <AvatarGroup max={8}>
          {groupsUsers.map((user: any) => {
            const { id, picture, firstName, lastName } = user.user;

            return (
              <Avatar key={id} alt={`${firstName} ${lastName}`} src={picture} />
            );
          })}
        </AvatarGroup>

        {isEditor && (
          <Autocomplete
            options={filteredUsers}
            isOptionEqualToValue={(option, value) =>
              option.userName === value.userName
            }
            getOptionLabel={(option: any) => option.userName}
            sx={{
              marginTop: 2,
              minWidth: 250,
              // alignSelf: 'flex-start',
            }}
            renderOption={(option: any, props: any) => {
              const { id, userName, picture } = props;

              return (
                <li
                  key={id}
                  className="autocomplete-option"
                  onClick={() =>
                    linkGroupUser({ variables: { userId: id, groupId } })
                  }
                >
                  <Avatar
                    key={id}
                    alt={userName}
                    src={picture}
                    sx={{ marginRight: 1 }}
                  />
                  <div>{userName}</div>
                </li>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Add member to group"
                sx={{
                  bgcolor: 'white',
                  '& .MuiTextField-root': {
                    backgroundColor: 'white',
                  },
                }}
              />
            )}
          />
        )}
      </div>
      {/* </Grid> */}
      {/* </Grid> */}

      <GigsPage />
    </div>
  );
}
