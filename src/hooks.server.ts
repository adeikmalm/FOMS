import type { Handle } from '@sveltejs/kit';
import { StatusCodes } from 'http-status-codes';
import { OurBaseError } from '$lib/server/core/error';
import type { OurResponse } from '$lib/server/types/response';
import { handleError as globalError } from '$lib/errorHandler';
import { Prisma } from '@prisma/client';

export const handle = async ({ event, resolve }) => {
	try {
		return resolve(event);
	} catch (error) {
		// Catch and handle unexpected errors
		return error;
	}
};





// import type { Handle } from '@sveltejs/kit';
// import type { OurResponse } from '$lib/server/types/response';
//
// export const handle: Handle = async ({ event, resolve }) => {
// 	try {
// 		const response = await resolve(event);
// 		return response;
// 	} catch (error) {
// 		throw error;
// 	}
// };
//
// export const handleError = async ({ error }) => {
// 	// If status is an error, handle it
// 	return new Response(globalError({ error }));
// }

export const handleError: ({ error }: { error: any }) => OurResponse<any> = ({ error }): OurResponse<any> => {

	if (error instanceof Prisma.PrismaClientKnownRequestError) {
		return {
			code: StatusCodes.INTERNAL_SERVER_ERROR,
			status: 'DATABASE ERROR',
			recordsTotal: 0,
			data: null,
			error: {
				message: error.message
			}
		};
	}

	if (error.name === 'TokenExpiredError') {
		if (error.message === 'invalid signature') {
			return {
				code: StatusCodes.FORBIDDEN,
				status: 'Forbidden',
				recordsTotal: 0,
				data: null,
				error: {
					message: 'Invalid Signature',
				}
			};
		} else {
			return {
				code: StatusCodes.FORBIDDEN,
				status: 'Forbidden',
				recordsTotal: 0,
				data: null,
				error: {
					message: 'Token Is Invalid Or No Longer Valid',
				}
			};
		}
	}

	if (error.name === 'MulterError') {
		const errorObj: Record<string, string[]> = {};
		errorObj[error.field] = [error.message];

		return {
			code: StatusCodes.BAD_REQUEST,
			status: 'LIMIT_FILE_SIZE',
			recordsTotal: 0,
			data: null,
			error: errorObj
		};
	}

	if (error.name === 'ValidationError') {
		const errorObj: Record<string, string[]> = {};

		for (const detail of error.details) {
			errorObj[detail.path] = [detail.message];
		}

		return {
			code: StatusCodes.BAD_REQUEST,
			status: 'Bad Request',
			recordsTotal: 0,
			data: null,
			error: errorObj
		};
	}

	if (error.name === 'SequelizeValidationError') {
		return {
			code: 400,
			status: 'Sequelize Validation Error',
			recordsTotal: 0,
			data: null,
			error: error.errors
		};
	}

	if (error instanceof OurBaseError) {
		return {
			code: error.errorCode,
			status: error.statusCode,
			recordsTotal: 0,
			data: null,
			error: {
				message: error.message
			}
		};
	}

	return {
		code: StatusCodes.INTERNAL_SERVER_ERROR,
		status: 'Internal Server Error',
		recordsTotal: 0,
		data: null,
		error: {
			message: error.message || 'Internal Server Error',
		}
	};
};