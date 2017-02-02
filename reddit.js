var bcrypt = require('bcrypt');
var HASH_ROUNDS = 10;


module.exports = function RedditAPI(conn) {
  return {
    createUser: function(user, callback) {
      
      // first we have to hash the password...
      bcrypt.hash(user.password, HASH_ROUNDS, function(err, hashedPassword) {
        if (err) {
          callback(err);
        }
        else {
          conn.query(
            'INSERT INTO users (username, password, createdAt) VALUES (?, ?, ?)', [user.username, hashedPassword, new Date()],
            function(err, result) {
              if (err) {
                /*
                There can be many reasons why a MySQL query could fail. While many of
                them are unknown, there's a particular error about unique usernames
                which we can be more explicit about!
                */
                if (err.code === 'ER_DUP_ENTRY') {
                  callback(new Error('A user with this username already exists'));
                }
                else {
                  callback(err);
                }
              }
              else {
                /*
                Here we are INSERTing data, so the only useful thing we get back
                is the ID of the newly inserted row. Let's use it to find the user
                and return it
                */
                conn.query(
                  'SELECT id, username, createdAt, updatedAt FROM users WHERE id = ?', [result.insertId],
                  function(err, result) {
                    if (err) {
                      callback(err);
                    }
                    else {
                      /*
                      Finally! Here's what we did so far:
                      1. Hash the user's password
                      2. Insert the user in the DB
                      3a. If the insert fails, report the error to the caller
                      3b. If the insert succeeds, re-fetch the user from the DB
                      4. If the re-fetch succeeds, return the object to the caller
                      */
                        callback(null, result[0]);
                    }
                  }
                );
              }
            }
          );
        }
      });
    },
    createPost: function(post, callback) {
      conn.query(
        'INSERT INTO posts (userId, title, url, subredditId, createdAt) VALUES (?, ?, ?, ?, ?)', [post.userId, post.title, post.url, post.subredditId, new Date()],
        function(err, result) {
          if (err) {
            callback(err);
          }
          else {
            /*
            Post inserted successfully. Let's use the result.insertId to retrieve
            the post and send it to the caller!
            */
            conn.query(
              'SELECT id, title, url, userId, subredditId, createdAt, updatedAt FROM posts WHERE id = ?', [result.insertId],
              function(err, result) {
                if (err) {
                  callback(err);
                }
                else {
                  callback(null, result[0]);
                }
              }
            );
          }
        }
      );
    },
    getAllPosts: function(options, callback) {
      // In case we are called without an options parameter, shift all the parameters manually
      if (!callback) {
        callback = options;
        options = {};
      }
      var limit = options.numPerPage || 25; // if options.numPerPage is "falsy" then use 25
      var offset = (options.page || 0) * limit;
      var sort = options.sort || `top`; 
      
      if (sort === 'top') {
        sort = `voteScore DESC`;
      }
      else if (sort === 'newest') {
        sort = 'posts.createdAt DESC';
      }
      else if (sort === 'hotness') {
        sort = `voteScore DESC, posts.createdAt ASC `;
      }
      else if (sort === 'controversial') {
        sort = `voteScore DESC, vote DESC`;
      }
      
      conn.query(`
        SELECT posts.id, 
        posts.title, 
        posts.url, 
        posts.userId, 
        posts.createdAt, 
        posts.updatedAt, 
        users.id AS usersUserId, 
        users.username AS usersUserName, 
        users.createdAt AS usersCreatedAt, 
        users.updatedAt As usersUpdatedAt,
        subreddit.id AS subRedditId,
        subreddit.name AS subRedditName,
        subreddit.description AS subRedditDescription,
        subreddit.createdAt AS subRedditCreatedAt,
        subreddit.updatedAt AS subRedditUpdatedAt,
        SUM(vote) as voteScore
        FROM posts
        LEFT JOIN users ON posts.userId = users.id
        LEFT JOIN subreddit ON posts.subredditId = subreddit.id
        LEFT JOIN votes ON posts.id = postId
        GROUP BY postId
        ORDER BY voteScore DESC, vote DESC
        LIMIT ? OFFSET ?`
        //$ {sort}
        , [limit, offset],
        function(err, results) {
          if (err) {
            callback(err);
          }
          else {
            callback(null, results.map(function(item) {
              return ({
                id: item.id,
                title: item.title,
                url: item.url,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                userId: item.userId,
                user: {
                  id: item.usersUserId,
                  username: item.usersUserName,
                  createdAt: item.usersCreatedAt,
                  updatedAt: item.usersUpdatedAt
                },
                subreddit: {
                  id: item.subRedditId,
                  name: item.subRedditName,
                  description: item.subRedditDescription,
                  createdAt: item.subRedditCreatedAt,
                  updatedAt: item.subRedditUpdatedAt
                }
              });
            }));
          }
        }
      );
    },
    getAllPostsForUser: function(userId, options, callback) {
      if (!callback) {
        callback = options;
        options = {};
      }
      var limit = options.numPerPage || 25;
      var offset = (options.page || 0) * limit;
      
      conn.query(`
        SELECT posts.id, 
        posts.title, 
        posts.url, 
        posts.userId, 
        posts.createdAt, 
        posts.updatedAt, 
        users.id,
        users.username,
        users.createdAt AS usersCreatedAt, 
        users.updatedAt AS userUpdatedAt
        FROM posts
        JOIN users on posts.userId = users.id
        WHERE users.id = ?
        ORDER BY createdAt ASC
        LIMIT ? OFFSET ?`
        , [userId, limit, offset],
        function(err, results) {
          if (err) {
            callback(err);
          }
          else {
            callback(null, results.map(function(item) {
              return ({
                id: item.id,
                title: item.title,
                url: item.url,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                userId: item.userId,
                user: {
                  id: item.usersUserId,
                  username: item.usersUserName,
                  createdAt: item.usersCreatedAt,
                  updatedAt: item.usersUpdatedAt
                }
              });
            }));
          }
        }
      );
    },
    getSinglePost: function(postId, callback) {
      if (!callback) {
        callback = postId;
        postId = {};
      }
      var limit = postId.numPerPage || 1;
      var offset = (postId.page || 0) * limit;
      
      conn.query(`
        SELECT posts.id, 
        posts.title, 
        posts.url, 
        posts.userId, 
        posts.createdAt, 
        posts.updatedAt, 
        users.id AS usersUserId,
        users.username AS usersUserName,
        users.createdAt AS usersCreatedAt, 
        users.updatedAt AS usersUpdatedAt
        FROM posts
        JOIN users on posts.userId = users.id
        WHERE posts.id = ?`
        , [postId],
        function(err, results) {
          if (err) {
            callback(err);
          }
          else {
            callback(null, results.map(function(item) {
              return ({
                id: item.id,
                title: item.title,
                url: item.url,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                userId: item.userId,
                user: {
                  id: item.usersUserId,
                  username: item.usersUserName,
                  createdAt: item.usersCreatedAt,
                  updatedAt: item.usersUpdatedAt
                }
              });
            }));
          }
        }
      );
    },
    createSubreddit: function(sub, callback) {
      conn.query(
        'INSERT INTO subreddit (name, description, createdAt) VALUES (?, ?, ?)', [sub.name, sub.description, new Date()],
        function(err, result) {
          if (err) {
            callback(err);
          }
          else {
            conn.query(
              'SELECT id, name, description, createdAt, updatedAt FROM subreddit WHERE id = ?', [result.insertId],
              function(err, result) {
                if (err) {
                  callback(err);
                }
                else {
                  callback(null, result[0]);
                }
              }
            );
          }
        }
      );
    },
    getAllSubreddits: function(callback, options) {
      conn.query(`
        SELECT id, 
        name,
        description,
        createdAt,
        updatedAt
        FROM subreddit
        ORDER BY createdAt ASC
        `,
        function(err, result) {
          if (err) {
            callback(err);
          }
          else {
            callback(null, function(result){
              return result;
            });
          }
        }
      );
    },
    createOrUpdateVote: function(vote, callback) {
      var postId = vote.postId;
      var userId = vote.userId;
      var voteDir = vote.voteDir;
      if (voteDir !== 0 && voteDir !== 1 && voteDir !== -1) {
        console.log("Vote did not equal 1, 0 or -1.");
      }
      else {
        conn.query(`
          INSERT INTO votes 
          SET postId=?, userId=?, vote=?, createdAt = NOW() 
          ON DUPLICATE 
          KEY UPDATE vote=?`, [postId, userId, voteDir, voteDir],
          function(err, results) {
            if (err) {
              callback(err);
            }
            else {
              callback(null, results);
              return results;
            }
          }
        );
      }
    }
  };
};