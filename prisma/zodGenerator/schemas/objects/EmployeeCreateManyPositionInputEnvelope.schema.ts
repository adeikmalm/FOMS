import { z } from 'zod';
import { EmployeeCreateManyPositionInputObjectSchema } from './EmployeeCreateManyPositionInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.EmployeeCreateManyPositionInputEnvelope> = z
	.object({
		data: z.union([
			z.lazy(() => EmployeeCreateManyPositionInputObjectSchema),
			z.lazy(() => EmployeeCreateManyPositionInputObjectSchema).array()
		]),
		skipDuplicates: z.boolean().optional()
	})
	.strict();

export const EmployeeCreateManyPositionInputEnvelopeObjectSchema = Schema;
