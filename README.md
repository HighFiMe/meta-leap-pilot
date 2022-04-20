# Meta Leap Club

## About
  Meta Leap Is an open protocol which splits the ownership and usage rights of the NFT asset. This allows organizations to manage their NFTs trustlessly as they managers/moderators can not execute actions but not change ownership of the NFT.

The stack is available for projects to leverage at Zero-Cost. You need to integrate with the API exposed by MetaLeap to support different access rights.
  
The API endpoints are available at the [docs](https://docs.metaleap.club/concepts/introduction).

## Roles & Access Rights
Current Smart Contract support Onwer, Manager and User Roles.
Owner - Owner of the underlying asset who can assign a manager and user.
Manager - A moderator or person who can change the address user role is assigned to.
User - The person ultimately given usage rights for the NFT asset. By default it is the owner.

Once the player is changed, owner no longer has the user rights it explicitly changed backed. To ensure this, the original NFT is locked in the protocol and a wrapped NFT is minted and given to the owner. Thus the project just needs to check if the owner is the protocol, then the API needs to be invoked to check for the current user.

## Roadmap
The team is actively enagaging with the community to speed things up. As the stack is available at Zero-Cost to projects, we're talking to communities for small grants to keep things going and relying on open source contribution mainly.

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
