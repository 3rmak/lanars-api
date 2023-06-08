import { PaginationDto } from '../pagination.dto';

export interface PaginationSequelizeResponseDto {
  page: number;
  limit: number;
  offset: number;
}

export class PaginationUtility {
  constructor(private defaultPerPage: number) {}

  public parse(query: PaginationDto): PaginationSequelizeResponseDto {
    const page = query.page ? query.page : 0;
    const limit = query.per_page ? query.per_page : this.defaultPerPage;
    const offset = page ? (page - 1) * limit : 0;

    return { page, limit, offset };
  }
}
