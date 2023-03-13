import { HttpService } from '@nestjs/axios';
import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CustomConfigService } from 'common/config/custom-config.service';
import { lastValueFrom, map } from 'rxjs';

@Injectable()
export class UserAuthService {
  constructor(
    private http: HttpService,
    private configService: CustomConfigService,
  ) {}

  // Request to the external auth service
  async getRolesByUserId(userId: string) {
    try {
      const data = await lastValueFrom(
        this.http
          .get(`${this.configService.USER_AUTH_SERVICE_URL}/roles/${userId}`)
          .pipe(map((res) => res.data)),
      );

      return data;
    } catch (error) {
      if (error?.response?.status) {
        throw new HttpException(error?.response?.data, error.response.status);
      }

      throw new InternalServerErrorException();
    }
  }
}
