import './gigs-page.css';

import { useLazyQuery, useReactiveVar } from '@apollo/client';
import { groupIdVar } from '../../constants/cache';
import { GET_GIGS_BY_GROUP } from '../../constants/queries';
import { NavLink } from 'react-router-dom';
import Loading from '../../components/Loading/Loading';
import { useEffect } from 'react';
import { Avatar } from '@mui/material';

export default function GigsPage() {
  const groupId = useReactiveVar(groupIdVar);

  const [getGigsByGroup, { loading, error, data }] =
    useLazyQuery(GET_GIGS_BY_GROUP);

  useEffect(() => {
    if (groupId) {
      getGigsByGroup({
        variables: { groupId },
      });
    }
  }, [groupId]);

  if (loading || !data) {
    return <Loading />;
  }

  if (error) {
    console.error(error);
    return <div>Error!</div>;
  }

  const { name, gigs, groupsUsers } = data.groups_by_pk;

  //Logs;
  // console.log('data :>> ', data);
  // console.log('groupId :>> ', groupId);
  // console.log('groupsUsers', groupsUsers[0].user);

  return (
    <div className="gigs-container d-flex flex-column p-3 align-items-center">
      <div>
        <h2>{name}</h2>
      </div>
      <div>
        <h4>Members:</h4>
        {groupsUsers.map((user: any) => {
          const { id, picture, firstName, lastName } = user.user;

          return (
            <Avatar
              key={id}
              alt={`${firstName} ${lastName}`}
              src={picture}
              sx={{ width: 60, height: 60 }}
            />
          );
        })}
      </div>
      <div className=" d-flex flex-wrap justify-content-around mt-5">
        {gigs.map((gig: any) => {
          const { id, gigDate, gigTitle, gigStatus } = gig;

          let borderColor: string;

          switch (gigStatus) {
            case 'requested': {
              borderColor = '#eee83C';
              break;
            }
            case 'offered': {
              borderColor = '#fd7520';
              break;
            }
            case 'confirmed': {
              borderColor = '#3a780b';
              break;
            }
            case 'cancelled': {
              borderColor = '#f21313';
              break;
            }
            case 'afterSale': {
              borderColor = '#247ba0';
              break;
            }
            default: {
              borderColor = 'black';
            }
          }

          return (
            <NavLink
              to={`/gigs/${id}`}
              key={id}
              className="card radialGradient"
            >
              <div
                className="card-banner"
                style={{ backgroundColor: borderColor }}
              ></div>
              <div>
                <h3 className="card-date">
                  <span>{gigDate}</span>
                </h3>
                <h4 className="card-title">
                  <span>{gigTitle}</span>
                </h4>
              </div>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}