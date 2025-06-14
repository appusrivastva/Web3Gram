// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.7.0 <0.9.0;

//import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
//import "@openzeppelin/contracts/security/Pausable.sol";

contract SocialMedia is ReentrancyGuard, Pausable {
    event newUserRegister(address indexed userAddress, string username);
    event postCreated(
        address indexed userAddress,
        uint256 postId,
        string content
    );
    event followingUpdated(address indexed user, address indexed followedUser);
    event followerUpdated(address indexed user, address indexed follower);
    event commented(
        address indexed commenter,


        
        uint256 postId,
        address indexed postOwner,
        string content
    );
    event Liked(
        address indexed liker,
        uint256 postId,
        address indexed postOwner
    );
    event ProfileUpdated(address indexed user, string profileURI);

    struct User {
        address UserAddress;
        string UserName;
        string bio;
        string profileURI;
        uint256 follower;
        uint256 following;
        uint256 totalPost;
        bool isRegister;
    }

    struct Post {
        uint256 postId;
        string content;
        string mediaURI;
        uint256 likesCount;
        uint256 commentsCount;
    }

    struct Comment {
        address commenter;
        string content;
        uint256 timestamp;
    }

    mapping(address => User) public user_profile;
    address[] public registeredUsers;

    mapping(address => address[]) public allFollowing;
    mapping(address => address[]) public allFollowers;

    mapping(address => mapping(uint256 => Post)) public posts;
    mapping(address => uint256[]) public userPosts;

    mapping(address => mapping(address => bool)) public isFollowing;

    mapping(address => mapping(address => mapping(uint256 => bool)))
        public hasLiked;
    mapping(address => mapping(uint256 => address[])) public postLikers;

    mapping(address => mapping(uint256 => Comment[])) public postComments;

    uint256 public nextPostId;

    // ---------------------------
    // User functions
    // ---------------------------
    function register(string memory _bio, string memory _username) external {
        require(!user_profile[msg.sender].isRegister, "Already registered");
        require(bytes(_username).length > 0, "Username required");

        user_profile[msg.sender] = User({
            UserAddress: msg.sender,
            UserName: _username,
            bio: _bio,
            profileURI: "",
            follower: 0,
            following: 0,
            totalPost: 0,
            isRegister: true
        });
        registeredUsers.push(msg.sender);
        emit newUserRegister(msg.sender, _username);
    }

    function updateProfileURI(string memory _uri) external {
        require(user_profile[msg.sender].isRegister, "Not registered");
        user_profile[msg.sender].profileURI = _uri;
        emit ProfileUpdated(msg.sender, _uri);
    }

    // ---------------------------
    // Post functions
    // ---------------------------
    function createPost(string memory _content, string memory _mediaURI)
        external
    {
        require(user_profile[msg.sender].isRegister, "Not registered");

        uint256 postId = nextPostId++;
        posts[msg.sender][postId] = Post({
            postId: postId,
            content: _content,
            mediaURI: _mediaURI,
            likesCount: 0,
            commentsCount: 0
        });

        userPosts[msg.sender].push(postId);
        user_profile[msg.sender].totalPost++;
        emit postCreated(msg.sender, postId, _content);
    }

    function deletePost(uint256 postId) external {
        require(posts[msg.sender][postId].postId == postId, "Invalid post ID");
        delete posts[msg.sender][postId];
        user_profile[msg.sender].totalPost--;

        uint256[] storage postIds = userPosts[msg.sender];
        for (uint256 i = 0; i < postIds.length; i++) {
            if (postIds[i] == postId) {
                postIds[i] = postIds[postIds.length - 1];
                postIds.pop();
                break;
            }
        }
        delete postComments[msg.sender][postId];
        delete postLikers[msg.sender][postId];
    }

    // ---------------------------
    // Like / Comment
    // ---------------------------
    function likePost(address postOwner, uint256 postId) external {
        require(!hasLiked[msg.sender][postOwner][postId], "Already liked");
        hasLiked[msg.sender][postOwner][postId] = true;
        posts[postOwner][postId].likesCount++;
        postLikers[postOwner][postId].push(msg.sender);
        emit Liked(msg.sender, postId, postOwner);
    }

    function unlikePost(address postOwner, uint256 postId) external {
        require(hasLiked[msg.sender][postOwner][postId], "Not liked yet");
        hasLiked[msg.sender][postOwner][postId] = false;
        posts[postOwner][postId].likesCount--;

        address[] storage likers = postLikers[postOwner][postId];
        for (uint256 i = 0; i < likers.length; i++) {
            if (likers[i] == msg.sender) {
                likers[i] = likers[likers.length - 1];
                likers.pop();
                break;
            }
        }
    }

    function addComment(
        address postOwner,
        uint256 postId,
        string memory content
    ) external {
        require(bytes(content).length > 0, "Comment empty");
        Comment memory newComment = Comment(
            msg.sender,
            content,
            block.timestamp
        );
        postComments[postOwner][postId].push(newComment);
        posts[postOwner][postId].commentsCount++;
        emit commented(msg.sender, postId, postOwner, content);
    }

    // ---------------------------
    // Follow / Unfollow
    // ---------------------------
    function follow(address friendAddress) external {
        require(friendAddress != msg.sender, "Can't follow yourself");
        require(!isFollowing[msg.sender][friendAddress], "Already following");

        isFollowing[msg.sender][friendAddress] = true;
        user_profile[msg.sender].following++;
        user_profile[friendAddress].follower++;

        allFollowing[msg.sender].push(friendAddress);
        allFollowers[friendAddress].push(msg.sender);

        emit followingUpdated(msg.sender, friendAddress);
        emit followerUpdated(friendAddress, msg.sender);
    }

    function unfollow(address userAddress) external {
        require(isFollowing[msg.sender][userAddress], "Not following");
        isFollowing[msg.sender][userAddress] = false;
        user_profile[msg.sender].following--;
        user_profile[userAddress].follower--;

        address[] storage f1 = allFollowing[msg.sender];
        for (uint256 i = 0; i < f1.length; i++) {
            if (f1[i] == userAddress) {
                f1[i] = f1[f1.length - 1];
                f1.pop();
                break;
            }
        }

        address[] storage f2 = allFollowers[userAddress];
        for (uint256 i = 0; i < f2.length; i++) {
            if (f2[i] == msg.sender) {
                f2[i] = f2[f2.length - 1];
                f2.pop();
                break;
            }
        }

        emit followingUpdated(msg.sender, userAddress);
        emit followerUpdated(userAddress, msg.sender);
    }

    // ---------------------------
    // View functions for frontend
    // ---------------------------

    function getUserProfile(address user) external view returns (User memory) {
        return user_profile[user];
    }

    function getAllRegisteredUsers() external view returns (address[] memory) {
        return registeredUsers;
    }

    function getUserPosts(address user) external view returns (Post[] memory) {
        uint256[] storage ids = userPosts[user];
        Post[] memory result = new Post[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = posts[user][ids[i]];
        }
        return result;
    }

    function getComments(address postOwner, uint256 postId)
        external
        view
        returns (Comment[] memory)
    {
        return postComments[postOwner][postId];
    }

    function getPostLikers(address postOwner, uint256 postId)
        external
        view
        returns (address[] memory)
    {
        return postLikers[postOwner][postId];
    }

    function getFollowers(address user)
        external
        view
        returns (address[] memory)
    {
        return allFollowers[user];
    }

    function getFollowing(address user)
        external
        view
        returns (address[] memory)
    {
        return allFollowing[user];
    }

    function isUserFollowing(address user, address target)
        external
        view
        returns (bool)
    {
        return isFollowing[user][target];
    }

    function didUserLike(
        address user,
        address postOwner,
        uint256 postId
    ) external view returns (bool) {
        return hasLiked[user][postOwner][postId];
    }
}



