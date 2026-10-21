const {UserRoles} = require("../config/enums");
const {HttpError, HttpCodes} = require("../config/http");

async function isSuperAdmin(req, res, next) {
console.log('in middleware-superadmin');
    const user = res.locals.user;
    try {
        if(user.role != UserRoles.SUPER_ADMIN)
            throw new HttpError(HttpCodes.UNAUTHORIZED, "This user is not a Super Admin", Error().stack);
        res.locals.superAdmin = await user.getSuperAdmin();
        return next();
    } catch (error) {
        console.log('in middleware-superadmin error',error);
        next(error);
    }
}

module.exports = isSuperAdmin;
