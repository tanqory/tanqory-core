import { TanqoryLogger } from '@/logger';
import { LogLevel } from '@/types';

// Mock console methods
const originalConsole = {
  debug: console.debug,
  info: console.info,
  warn: console.warn,
  error: console.error,
};

describe('TanqoryLogger', () => {
  let logger: TanqoryLogger;
  let mockConsole: {
    debug: jest.Mock;
    info: jest.Mock;
    warn: jest.Mock;
    error: jest.Mock;
  };

  beforeEach(() => {
    // Mock console methods
    mockConsole = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    console.debug = mockConsole.debug;
    console.info = mockConsole.info;
    console.warn = mockConsole.warn;
    console.error = mockConsole.error;

    // Mock Date.now() for consistent timestamps
    const mockDate = new Date('2023-01-01T10:00:00.000Z');
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(mockDate.toISOString());
  });

  afterEach(() => {
    // Restore console methods
    console.debug = originalConsole.debug;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;

    jest.restoreAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with default log level (info)', () => {
      logger = new TanqoryLogger();

      logger.debug('debug message');
      logger.info('info message');

      expect(mockConsole.debug).not.toHaveBeenCalled();
      expect(mockConsole.info).toHaveBeenCalledTimes(1);
    });

    it('should initialize with custom log level', () => {
      logger = new TanqoryLogger('debug');

      logger.debug('debug message');
      logger.info('info message');

      expect(mockConsole.debug).toHaveBeenCalledTimes(1);
      expect(mockConsole.info).toHaveBeenCalledTimes(1);
    });
  });

  describe('Log Level Management', () => {
    beforeEach(() => {
      logger = new TanqoryLogger('info');
    });

    it('should set log level dynamically', () => {
      logger.debug('debug before');
      expect(mockConsole.debug).not.toHaveBeenCalled();

      logger.setLevel('debug');
      logger.debug('debug after');
      expect(mockConsole.debug).toHaveBeenCalledTimes(1);
    });

    it('should respect log level hierarchy', () => {
      const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];

      levels.forEach((level) => {
        logger.setLevel(level);

        // Clear previous calls
        jest.clearAllMocks();

        // Test all log methods
        logger.debug('debug message');
        logger.info('info message');
        logger.warn('warn message');
        logger.error('error message');

        // Check which methods should be called based on level
        const levelIndex = levels.indexOf(level);

        expect(mockConsole.debug).toHaveBeenCalledTimes(levelIndex <= 0 ? 1 : 0);
        expect(mockConsole.info).toHaveBeenCalledTimes(levelIndex <= 1 ? 1 : 0);
        expect(mockConsole.warn).toHaveBeenCalledTimes(levelIndex <= 2 ? 1 : 0);
        expect(mockConsole.error).toHaveBeenCalledTimes(1); // Error always called
      });
    });
  });

  describe('Log Methods', () => {
    beforeEach(() => {
      logger = new TanqoryLogger('debug'); // Enable all levels
    });

    describe('debug', () => {
      it('should log debug messages with correct format', () => {
        logger.debug('Debug message');

        expect(mockConsole.debug).toHaveBeenCalledWith(
          '[2023-01-01T10:00:00.000Z] [DEBUG] @tanqory/core: Debug message'
        );
      });

      it('should log debug messages with additional arguments', () => {
        const obj = { key: 'value' };
        logger.debug('Debug with object', obj, 123);

        expect(mockConsole.debug).toHaveBeenCalledWith(
          '[2023-01-01T10:00:00.000Z] [DEBUG] @tanqory/core: Debug with object',
          obj,
          123
        );
      });

      it('should not log debug messages when level is higher', () => {
        logger.setLevel('info');
        logger.debug('Debug message');

        expect(mockConsole.debug).not.toHaveBeenCalled();
      });
    });

    describe('info', () => {
      it('should log info messages with correct format', () => {
        logger.info('Info message');

        expect(mockConsole.info).toHaveBeenCalledWith(
          '[2023-01-01T10:00:00.000Z] [INFO] @tanqory/core: Info message'
        );
      });

      it('should log info messages with additional arguments', () => {
        logger.info('Info message', { data: 'test' });

        expect(mockConsole.info).toHaveBeenCalledWith(
          '[2023-01-01T10:00:00.000Z] [INFO] @tanqory/core: Info message',
          { data: 'test' }
        );
      });

      it('should not log info messages when level is higher', () => {
        logger.setLevel('warn');
        logger.info('Info message');

        expect(mockConsole.info).not.toHaveBeenCalled();
      });
    });

    describe('warn', () => {
      it('should log warn messages with correct format', () => {
        logger.warn('Warning message');

        expect(mockConsole.warn).toHaveBeenCalledWith(
          '[2023-01-01T10:00:00.000Z] [WARN] @tanqory/core: Warning message'
        );
      });

      it('should log warn messages with additional arguments', () => {
        logger.warn('Warning', new Error('test error'));

        expect(mockConsole.warn).toHaveBeenCalledWith(
          '[2023-01-01T10:00:00.000Z] [WARN] @tanqory/core: Warning',
          new Error('test error')
        );
      });

      it('should not log warn messages when level is higher', () => {
        logger.setLevel('error');
        logger.warn('Warning message');

        expect(mockConsole.warn).not.toHaveBeenCalled();
      });
    });

    describe('error', () => {
      it('should log error messages with correct format', () => {
        logger.error('Error message');

        expect(mockConsole.error).toHaveBeenCalledWith(
          '[2023-01-01T10:00:00.000Z] [ERROR] @tanqory/core: Error message'
        );
      });

      it('should log error messages with additional arguments', () => {
        const error = new Error('Test error');
        logger.error('Error occurred', error, { context: 'test' });

        expect(mockConsole.error).toHaveBeenCalledWith(
          '[2023-01-01T10:00:00.000Z] [ERROR] @tanqory/core: Error occurred',
          error,
          { context: 'test' }
        );
      });

      it('should always log error messages regardless of level', () => {
        const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];

        levels.forEach((level) => {
          logger.setLevel(level);
          jest.clearAllMocks();

          logger.error('Error message');
          expect(mockConsole.error).toHaveBeenCalledTimes(1);
        });
      });
    });
  });

  describe('Message Formatting', () => {
    beforeEach(() => {
      logger = new TanqoryLogger('debug');
    });

    it('should format timestamp correctly', () => {
      logger.info('Test message');

      const call = mockConsole.info.mock.calls[0][0];
      expect(call).toMatch(/^\[2023-01-01T10:00:00\.000Z\]/);
    });

    it('should include correct log level in uppercase', () => {
      logger.debug('Debug test');
      logger.info('Info test');
      logger.warn('Warn test');
      logger.error('Error test');

      expect(mockConsole.debug.mock.calls[0][0]).toContain('[DEBUG]');
      expect(mockConsole.info.mock.calls[0][0]).toContain('[INFO]');
      expect(mockConsole.warn.mock.calls[0][0]).toContain('[WARN]');
      expect(mockConsole.error.mock.calls[0][0]).toContain('[ERROR]');
    });

    it('should include package name in format', () => {
      logger.info('Test message');

      const call = mockConsole.info.mock.calls[0][0];
      expect(call).toContain('@tanqory/core:');
    });

    it('should handle empty messages', () => {
      logger.info('');

      expect(mockConsole.info).toHaveBeenCalledWith(
        '[2023-01-01T10:00:00.000Z] [INFO] @tanqory/core: '
      );
    });

    it('should handle messages with special characters', () => {
      const specialMessage = 'Message with "quotes" and \n newlines \t tabs';
      logger.info(specialMessage);

      expect(mockConsole.info).toHaveBeenCalledWith(
        `[2023-01-01T10:00:00.000Z] [INFO] @tanqory/core: ${specialMessage}`
      );
    });
  });

  describe('Multiple Arguments', () => {
    beforeEach(() => {
      logger = new TanqoryLogger('debug');
    });

    it('should pass through multiple arguments', () => {
      const obj = { key: 'value' };
      const arr = [1, 2, 3];
      const str = 'string arg';

      logger.info('Message', obj, arr, str);

      expect(mockConsole.info).toHaveBeenCalledWith(
        '[2023-01-01T10:00:00.000Z] [INFO] @tanqory/core: Message',
        obj,
        arr,
        str
      );
    });

    it('should handle undefined and null arguments', () => {
      logger.info('Message', undefined, null);

      expect(mockConsole.info).toHaveBeenCalledWith(
        '[2023-01-01T10:00:00.000Z] [INFO] @tanqory/core: Message',
        undefined,
        null
      );
    });

    it('should handle function arguments', () => {
      const fn = () => 'test';
      logger.info('Message', fn);

      expect(mockConsole.info).toHaveBeenCalledWith(
        '[2023-01-01T10:00:00.000Z] [INFO] @tanqory/core: Message',
        fn
      );
    });
  });

  describe('Performance', () => {
    beforeEach(() => {
      logger = new TanqoryLogger('warn'); // Set high level to test filtering
    });

    it('should not format messages when log level filters them out', () => {
      const expensiveOperation = jest.fn(() => 'expensive result');

      logger.debug('Debug message', expensiveOperation());
      logger.info('Info message', expensiveOperation());

      // Expensive operations should not be called since they won't be logged
      expect(mockConsole.debug).not.toHaveBeenCalled();
      expect(mockConsole.info).not.toHaveBeenCalled();
    });

    it('should format messages when they will be logged', () => {
      logger.warn('Warning message');
      logger.error('Error message');

      expect(mockConsole.warn).toHaveBeenCalledTimes(1);
      expect(mockConsole.error).toHaveBeenCalledTimes(1);
    });
  });
});
