// a function is going to accept a function (func)
// which will execute another function that catches any errors and passes them to next 
module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}

// we can now use this to wrap our asyncronous functions