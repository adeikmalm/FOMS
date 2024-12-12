import { prisma } from '$lib/server/prisma';
import { OurBaseError } from '$lib/server/core/error';
import { camelToSnake } from '$lib/server/utils/caseParser';

class PositionService {
    constructor() {
        this.DEFAULT_SIZE = 5;
    }

    async getAll(payload) {
        try {
            const result = { data: null, recordsTotal: 0 };

            const advSearch = payload?.advSearch ? JSON.parse(payload?.advSearch) : null;

            const positionRecords = await prisma.position.findMany({
                where: {
                    OR: advSearch
                        ? [
                            advSearch?.companyName
                                ? {
                                    company: {
                                        name: {
                                            contains: advSearch?.companyName
                                        }
                                    }
                                }
                                : undefined
                        ]
                        : undefined
                },
                skip: parseInt(String(payload?.start)) - 1 || 0,
                take: parseInt(String(payload?.length)) || this.DEFAULT_SIZE,
                orderBy: {
                    created_at: 'desc'
                },
                include: {
                    company: true,
                    detailPositions: {
                        include: {
                            level: true,
                            officer: true
                        }
                    }
                }
            });

            const recordsTotal = await prisma.position.findMany({
                where: {
                    OR: advSearch
                        ? [
                            advSearch?.companyName
                                ? {
                                    company: {
                                        name: {
                                            contains: advSearch.companyName
                                        }
                                    }
                                }
                                : undefined
                        ]
                        : undefined
                }
            });

            result.data = positionRecords;
            result.recordsTotal = recordsTotal.length || 0;

            return result;
        } catch (err) {
            return null;
        }
    }

    async getDetail(id) {
        const records = await prisma.position.findUnique({
            where: {
                id: id
            },
            include: {
                detailPositions: {
                    include: {
                        level: true,
                        officer: true
                    }
                }
            }
        });

        return {
            data: records,
            recordsTotal: records ? 1 : 0
        };
    }

    async save(payload) {
        try {
            if (payload.id && payload.id !== '' && payload.id !== null) {
                await prisma.position.update({
                    where: {
                        id: payload.id
                    },
                    data: {
                        company_id: payload.companyId,
                        basic_salary: parseFloat(payload.basicSalary)
                    }
                });

                await prisma.detailPosition.deleteMany({
                    where: {
                        position_id: payload.id
                    }
                });

                const newPayload = payload.options.map(v => ({
                    ...v,
                    positionId: payload.id
                }));

                await prisma.detailPosition.createMany({
                    data: newPayload
                });
            } else {
                const position = await prisma.position.create({
                    data: {
                        company_id: payload.companyId,
                        basic_salary: parseFloat(payload.basicSalary)
                    }
                });

                const newPayload = payload.options?.map(v => camelToSnake({
                    ...v,
                    id: undefined,
                    positionId: position.id
                }));

                console.info(newPayload);
                await prisma.detailPosition.createMany({
                    data: newPayload
                });
            }
        } catch (e) {
            throw new OurBaseError(400, 'Bad Request', e.toString());
        }
    }

    async delete(id) {
        return await prisma.position.delete({
            where: {
                id: id
            }
        });
    }
}

export default PositionService;
