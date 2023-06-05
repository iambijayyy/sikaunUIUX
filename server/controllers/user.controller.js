import User from '../models/user.js';
import Course from '../models/course.js';
import sendVerificationCodeTomail from '../middlewares/email.js'
import generateVerificationCode from './verificationcode.js'
class UserController {
	async getAll(req, res, next) {
		try {
			const theresQueries = req.query;
			let users;

			if (theresQueries) {
				const { role, search: userName } = req.query;
				users = await User.find({ role: { $regex: role }, name: { $regex: userName } });
				return res.status(200).json(users);
			}

			const allUsers = await User.find({});
			return res.status(200).json(allUsers);
		} catch (error) {
			next(error);
		}
	}

	async getOne(req, res, next) {
		try {
			const userId = req.params.id;
			const user = await User.findById(userId).populate({
				path: 'courses',
				populate: {
					path: 'creator',
				},
			});

			if (!user) throw new Error('ERROR');

			return res.status(200).json(user);
		} catch (error) {
			next(error);
		}
	}

	async edit(req, res, next) {
		try {
			const newUserInfo = req.body;
			const { userId } = req.params;

			// Check if a new profile image was provided in the request
			if (req.file) {
				const profileImage = req.file.filename;
				newUserInfo.profileImage = profileImage;
			}

			// Parse the courses value to an array of objects if it's a string
			if (typeof newUserInfo.courses === 'string') {
				if (newUserInfo.courses.trim() === '') {
					newUserInfo.courses = [];
				} else {
					newUserInfo.courses = JSON.parse(newUserInfo.courses);
				}

			}

			// Check if the user already exists and update it
			const updatedUser = await User.findByIdAndUpdate(userId, newUserInfo, { new: true });

			if (!updatedUser) {
				return res.status(404).json('USER_NOT_FOUND');
			}
			return res.status(200).json({ editedUser: updatedUser });
		} catch (error) {
			// Handle the error
			next(error);
		}
	}




	async remove(req, res, next) {
		const userToRemoveId = req.params.userId;

		try {
			// Remove the user
			const removedUser = await User.findByIdAndRemove(userToRemoveId);

			// Update the subscribers array of all courses that the user was suscribed to
			await Course.updateMany({ subscribers: { $in: userToRemoveId } }, { $pull: { subscribers: userToRemoveId } });

			return res.status(200).json(removedUser);
		} catch (error) {
			next(error);
		}
	}

	async editRange(req, res, next) {
		const userToBeEditedId = req.params.userId;
		const rank = req.params.rank;

		try {
			// Check if the role is correct
			if (rank !== 'admin' && rank !== 'teacher' && rank !== 'student') {
				throw Error('role invalid');
			}

			// Update the promoted user role
			const updatedUser = await User.findByIdAndUpdate(userToBeEditedId, { role: rank }, { new: true });

			return res.status(200).json(updatedUser);
		} catch (error) {
			next(error);
		}
	}

	async search(req, res, next) {
		const roleToSearch = req.query.role;
		const userName = req.query.search;

		try {
			const filteredUsers = await User.find({ role: { $regex: roleToSearch }, name: { $regex: userName } });
			return res.status(200).json(filteredUsers);
		} catch (error) {
			next(error);
		}
	}
	async updatePassword(req, res, next) {
		const { userId } = req.params;
		const { currentPassword, newPassword } = req.body;

		try {
			// Get the user by ID
			const user = await User.findById(userId);

			if (!user) {
				return res.status(404).json('User not found');
			}

			// Check if the current password matches the stored password
			if (user.password !== currentPassword) {
				return res.status(400).json('Invalid current password');
			}

			// Update the user's password
			user.password = newPassword;
			await user.save();

			return res.status(200).json('Password updated successfully');
		} catch (error) {
			next(error);
		}
	}




	async forgotPassword(req, res, next) {
		const { mail } = req.body;

		try {
			// Generate a verification code
			const verificationCode = generateVerificationCode();

			// Save the verification code in the database
			const user = await User.findOne({ mail });
			if (!user) {
				return res.status(404).json('User not found');
			}
			user.verificationCode = verificationCode;
			await user.save();

			// Send the verification code to the user's mail
			sendVerificationCodeTomail(mail, verificationCode);

			// console.log("Generated verification code:", verificationCode);
			return res.status(200).json({ message: 'Verification code sent successfully', verificationCode });
		} catch (error) {
			next(error);
		}
	}

	async verifyCode(req, res, next) {
		const { mail, verificationCode } = req.body;

		try {
			// Find the user by mail
			const user = await User.findOne({ mail });

			if (!user) {
				return res.status(404).json('User not found');
			}

			// Check if the verification code matches
			if (user.verificationCode !== verificationCode) {
				return res.status(400).json('Invalid verification code');
			}

			return res.status(200).json({ message: 'Code is correct', verificationCode: user.verificationCode });
		} catch (error) {
			return res.status(500).json('Failed to verify code');
		}
	}


	async resetPassword(req, res, next) {
		const { mail, verificationCode, newPassword } = req.body;

		try {
			const user = await User.findOne({ mail });

			if (!user) {
				return res.status(404).json('User not found');
			}

			if (user.verificationCode !== verificationCode) {
				return res.status(400).json('Invalid verification code');
			}

			user.password = newPassword;
			user.verificationCode = null;
			await user.save();

			// Delete the verificationCode from the user document
			await User.updateOne({ _id: user._id }, { $unset: { verificationCode: 1 } });

			return res.status(200).json({ message: 'Password reset successfully' });
		} catch (error) {
			return res.status(500).json('Failed to reset password');
		}
	}



}




const userController = new UserController();
export default userController;
