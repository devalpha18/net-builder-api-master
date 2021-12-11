import {
  BadRequestException,
  Body,
  Controller,
  Get, Param,
  Post, Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ApiImplicitParam } from '@nestjs/swagger/dist/decorators/api-implicit-param.decorator';

import { TokenResponseDto } from './dtos/token-response.dto';
import { LoginDto } from './dtos/login.dto';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UserWithProfileDto } from '../user/dtos/user.dto';
import { AcceptInviteDto } from './dtos/accept-invite.dto';
import { AddUserDto } from '../user/dtos/add-user.dto';
import { UserRole } from '../common/enums/user-role.enum';
import { FriendDto } from '../user/dtos/friend.dto';
import { GetFriendsDto } from '../user/dtos/get-friends.dto';
import { UpdateUserDto } from '../user/dtos/update-user.dto';
import { SuccessResponse } from '../common/models/common.model';
import { UpdateUserVerificationDto } from './dtos/update-user-verification.dto';
import { ForgotPasswordVerificationDto } from './dtos/forgot-password-verification.dto';
import { ResetPasswordVerificationDto } from './dtos/reset-password-verification.dto';
import { MailService } from '../mail/mail.service';
import { SignupDto } from './dtos/signup.dto';

@Controller('api/auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly mailService: MailService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserWithProfileDto })
  async getAuth(@Request() req): Promise<UserWithProfileDto> {
    const user = await this.userService.findUserById(req.user.id);
    return user.toUserWithProfileDto();
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserWithProfileDto })
  async updateUser(@Request() req, @Body() body: UpdateUserDto): Promise<UserWithProfileDto> {
    const userId = req.user.id;
    const verification = await this.authService.findUpdateUserVerificationByUserIdAndCode(userId, body.code);
    // validate verification code
    if (!verification || verification.userId != userId || Date.now() > verification.exp * 1000) {
      throw new BadRequestException('invalid or expired verification code');
    }
    await this.authService.deleteUpdateUserVerification(verification);
    const tempUser = await this.userService.findOnlyUserByWalletAddress(body.walletAddress);
    if (tempUser) {
      throw new BadRequestException('This wallet address is used by others. Please try again with another wallet');
    }
    const user = await this.userService.findOnlyUserById(userId);
    if(body.email)
      user.email = body.email;
    if(body.walletAddress)
      user.walletAddress = body.walletAddress;
    if(body.password)
    {
      user.password = body.password;
      await user.preProcess();
    }
    await this.userService.saveUser(user);
    const userWithProfile = await this.userService.findUserById(userId);
    return userWithProfile.toUserWithProfileDto();
  }

  @Post('login')
  @ApiOkResponse({ type: TokenResponseDto })
  async login(@Body() body: LoginDto): Promise<TokenResponseDto> {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new BadRequestException('Incorrect email or password. Please try again.');
    }
    const accessToken = this.authService.login(user);
    if (!accessToken) {
      throw new BadRequestException('Token made failed. Please try again');
    }
    return { accessToken };
  }

  @Post('signup')
  @ApiOkResponse({ type: TokenResponseDto })
  async Signup(@Body() body: SignupDto): Promise<TokenResponseDto> {
    let invitee = "jami.admin@netbuilder.com";
    if(body.invitee) {
      invitee = body.invitee;
    }
    let invitor = null;
    try {
      invitor = await this.userService.findUserByEmail(invitee);
      if(!invitor) {
        throw new BadRequestException('Incorrect invitor email. Please try again with other invitor email address');
      }
    } catch (e) {
      throw new BadRequestException('Incorrect invitor email. Please try again with other invitor email address');
    }

    const payload: AddUserDto = {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      password: body.password,
      role: UserRole.User,
    };
    let user = await this.userService.add(payload);
    user = await this.userService.verifyEmail(user.email);

    await this.userService.walkthroughParents(invitor.invitation.id, user);

    const accessToken = this.authService.login(user);
    return { accessToken };
  }

  @Post('accept-invite/:email')
  @ApiImplicitParam({ name: 'email', required: true })
  @ApiOkResponse({ type: TokenResponseDto })
  async acceptInvite(@Param('email') email: string, @Body() body: AcceptInviteDto): Promise<TokenResponseDto> {
    const inviteId = (await this.userService.findUserByEmail(email)).invitation.id;
    try {
      const invitor = await this.userService.findOnlyUserByInviteId(inviteId);
      if(!invitor) {
        throw new BadRequestException('Incorrect invitor Id. Please try again with other invitation URL');
      }
    } catch (e) {
      throw new BadRequestException('Incorrect invitor Id. Please try again with other invitation URL');
    }
    const payload: AddUserDto = {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      password: body.password,
      role: UserRole.User,
    };
    let user = await this.userService.add(payload);
    user = await this.userService.verifyEmail(user.email);

    await this.userService.walkthroughParents(inviteId, user);

    const accessToken = this.authService.login(user);
    return { accessToken };
  }

  @Post('forgot-password')
  @ApiOkResponse({ type: UserWithProfileDto })
  async forgotPassword(@Body() body: ResetPasswordVerificationDto): Promise<UserWithProfileDto> {
    const verification = await this.authService.findForgotPasswordVerificationByEmailAndCode(body.email, body.code);
    // validate verification code
    if (!verification || verification.email !== body.email || Date.now() > verification.exp * 1000) {
      throw new BadRequestException('Incorrect or expired verification code and email. Please try again');
    }
    await this.authService.deleteForgotPasswordVerification(verification);
    const user = await this.userService.findOnlyUserByEmail(body.email);
    if (!user) {
      throw new BadRequestException('Incorrect email. Please try again with correct email');
    }
    user.password = body.password;
    await user.preProcess();
    await this.userService.saveUser(user);
    const userWithProfile = await this.userService.findUserById(user.id);
    if (!userWithProfile) {
      throw new BadRequestException('Incorrect user. Please try again with correct user');
    }
    return userWithProfile.toUserWithProfileDto();
  }

  @Get('friends')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: FriendDto, isArray: true })
  async getFriends(@Request() req): Promise<FriendDto[]> {
    const user = await this.userService.findUserById(req.user.id);
    if (!user) {
      throw new BadRequestException('Incorrect user. Please try again with correct user');
    }
    return user.friends.map(friend => friend.toFriendDto());
  }

  @Post('friends/:level')
  @ApiImplicitParam({ name: 'level', required: true })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: FriendDto, isArray: true })
  async getFriendsByLevel(@Param('level') level: number, @Request() req, @Body() body: GetFriendsDto): Promise<FriendDto[]> {
    const user = await this.userService.findUserById(req.user.id);
    if (!user) {
      throw new BadRequestException('Incorrect user. Please try again with correct user');
    }
    const friends = user.friends.map(friend => friend.toFriendDto());
    const result = [];
    friends.map(friend => {
      if(friend.user.email.includes(body.keyword) && friend.level == level)
        result.push(friend);
    });
    return result;
  }

  @Post('update-user-verification/add')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({type: SuccessResponse})
  async addUpdateUserVerification(@Request() req, @Body() body: UpdateUserVerificationDto): Promise<SuccessResponse> {
    // check for email existence
    if(!body.email) {
      throw new BadRequestException('Incorrect email. Please try again with correct email');
    }
    const verification = await this.authService.saveUpdateUserVerification(req.user.id);
    if (!verification) {
      throw new BadRequestException('Code made failed. Please try again');
    }
    await this.mailService.sendUpdateInfoCodeVerification(body.email, verification.code);
    return new SuccessResponse();
  }

  @Post('forgot-password-verification/add')
  @ApiOkResponse({type: SuccessResponse})
  async addForgotPasswordVerification(@Body() body: ForgotPasswordVerificationDto): Promise<SuccessResponse> {
    // check for email existence
    const user = await this.userService.findOnlyUserByEmail(body.email);
    if (!user) {
      throw new BadRequestException('Incorrect email. Please try again with correct email');
    }
    const verification = await this.authService.saveForgotPasswordVerification(body.email);
    if (!verification) {
      throw new BadRequestException('Code made failed. Please try again');
    }
    await this.mailService.sendForgotPasswordCodeVerification(verification.email, verification.code);
    return new SuccessResponse();
  }

  @Post('invitor/:level')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({type: SuccessResponse})
  async getInvitorByLevel(@Param('level') level: number, @Request() req): Promise<UserWithProfileDto> {
    const me = await this.userService.findUserById(req.user.id);
    if (!me) {
      throw new BadRequestException('Incorrect user. Please try again with correct user');
    }
    if((me.toUserWithProfileDto()).invitor == null)
      return me.toUserWithProfileDto();
    let userId = (me.toUserWithProfileDto()).invitor.id;
    let user = null;
    for (let i = 0; i < level; i++) {
      user = (await this.userService.findUserById(userId)).toUserWithProfileDto();
      if(user.invitor)
        userId = user.invitor.id;
      else
        break;
    }
    while(user.star < level && user.invitor && user.star <= 0) {
      userId = user.invitor.id;
      user = (await this.userService.findUserById(userId)).toUserWithProfileDto();
    }
    return user;
  }
}
