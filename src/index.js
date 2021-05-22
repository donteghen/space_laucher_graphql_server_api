require('dotenv').config();
const { ApolloServer } = require('apollo-server');
const typeDefs = require('./schema');
const { createStore } = require('./utils');
const LaunchAPI = require('./datasources/launch');
const UserAPI = require('./datasources/user');
const resolvers = require('./resolvers')
const store = createStore();
const server = new ApolloServer({ 
    
    typeDefs,
    resolvers,
    context : async ({req}) => {
        if(req && req.headers){
            
            const token = req.headers.authorization.replace('Bearer ', '');
            if(!token) return {user:null}
            const email = Buffer.from(token, 'base64').toString('ascii');
            const users = await store.users.findOrCreate({ where: { email } });
            if(!users || !users[0]) return {user: null}
            return {user : {...users[0].dataValues}}
        }
        return null
    },
    dataSources: () => ({
        launchAPI: new LaunchAPI(),
        userAPI: new UserAPI({ store })
      }),
});

server.listen().then(() => console.log(`Server is running!, Listening on port 4000 \n http://localhost:4000`))