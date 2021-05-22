const { paginateResults } = require('./utils');
module.exports = {
    
    Query: {
      launches: async (_, {pageSize=20, after}, { dataSources }) =>{
        const allLaunches = await dataSources.launchAPI.getAllLaunches()
        allLaunches.reverse();
      const launches = paginateResults({
        after,
        pageSize,
        results: allLaunches
      });
      return {
        launches,
        cursor: launches.length ? launches[launches.length - 1].cursor : null,
        
        hasMore: launches.length ? launches[launches.length - 1].cursor !== allLaunches[allLaunches.length - 1].cursor : false
      };
      },
        
      launch: (_, { id }, { dataSources }) =>{
        console.log(id)
        const res = dataSources.launchAPI.getLaunchById({ launchId: id })
        return res
      }
        ,
      me: (_, __, { dataSources }) => dataSources.userAPI.findOrCreateUser()
    },
    Mission :{
        missionPatch : (mission, {size} = {default : "LARGE"}) => {
            return size === "SMALL" ? mission.missionPatchSmall : mission.missionPatchLarge
        }
    },
    Launch : {
        isBooked : async(launch, __, {dataSources}) => await dataSources.userAPI.isBookedOnLaunch({launchId: launch.id})
    },
    
    User : {
        trips : async (_, __, {dataSources}) => {
            const launchIds = await dataSources.userAPI.getLaunchIdsByUser()
            if(launchId.length > 0){
                const userTrips = await dataSources.userAPI.bookTrips({launchIds})
                return userTrips;
            }
            return []
        }
    },
    Mutation : {
        login : async (_, {email}, {dataSources}) => {
            
            const user = await dataSources.userAPI.findOrCreateUser({email:email})
            
            user.token = Buffer.from(email).toString('base64');
            return user 
        },
        bookTrips : async(_, {launchIds}, { dataSources}) =>{
            const results = await dataSources.userAPI.bookTrips({launchIds});
            const launches = await dataSources.launchAPI.getAllLaunches({launchIds})
            return {
                success : results && results.length === launchIds.length,
                message : results.length === launchIds.length ? 'Trips booksed succesfully' : 
                `The following trips falied ${launchIds.filter(id => !results.includes(id))}`,
                launches
            }
        },
        cancelTrip: async (_, { launchId }, { dataSources }) => {
            const result = await dataSources.userAPI.cancelTrip({ launchId });
        
            if (!result)
              return {
                success: false,
                message: 'failed to cancel trip',
              };
        
            const launch = await dataSources.launchAPI.getLaunchById({ launchId });
            return {
              success: true,
              message: 'trip cancelled',
              launches: [launch],
            };
          },
    }
  };