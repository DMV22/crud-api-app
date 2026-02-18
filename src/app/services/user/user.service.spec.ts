import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService, User } from './user.service';

describe('Userervice', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  const mockUser: User =
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com'
  };
  const mockSettings = {
    theme: 'light',
    notifications: true,
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Перевірити що немає outstanding HTTP requests
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUser', () => {
    it('should return user from API', (done) => {
      // Arrange
      const expectedUrl = 'http://localhost:3000/user';

      // Act
      service.getUser().subscribe({
        next: (user) => {
          // Assert
          expect(user).toEqual(mockUser);
          expect(user.id).toBe("1");
          done();
        }
      });

      // Expect HTTP call
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');

      // Respond with mock data
      req.flush(mockUser);
    });

    it('should handle error gracefully', (done) => {
      service.getUser().subscribe({
        next: () => {
          fail("Expected an error, not a successful response'")
        },
        error: (err) => {
          expect(err).toBeTruthy();
          expect(err.status).toEqual(500);
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:3000/user');
      req.error(new ProgressEvent('Network error'), { status: 500 });
    });
  });

  describe('getSettings', () => {
    it('should return settings from API', (done) => {
      // Arrange
      const expectedUrl = 'http://localhost:3000/settings';

      // Act
      service.getSettings().subscribe({
        next: (settings) => {
          // Assert
          expect(settings).toEqual(mockSettings);
          expect(settings.theme).toBe("light");
          expect(settings.notifications).toBe(true);
          done();
        }
      });

      // Expect HTTP call
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');

      // Respond with mock data
      req.flush(mockSettings);
    });

    it('should handle error gracefully', (done) => {
      service.getSettings().subscribe({
        next: () => {
          fail("Expected an error, not a successful response'")
        },
        error: (err) => {
          expect(err).toBeTruthy();
          expect(err.status).toEqual(500);
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:3000/settings');
      req.error(new ProgressEvent('Network error'), { status: 500 });
    });
  });

});
