// firebase.js
// Firebase v10 modular Realtime Database integration for BirthdayBloom.

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import {
  getDatabase,
  ref,
  push,
  set,
  onValue,
  query,
  orderByChild,
  limitToLast,
  runTransaction,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js';

const firebaseConfig = {
  apiKey: 'AIzaSyBJeBP7CM6XXReYnf1NZ4F1svdyO3nrCg0',
  authDomain: 'ultah-2e627.firebaseapp.com',
  projectId: 'ultah-2e627',
  storageBucket: 'ultah-2e627.firebasestorage.app',
  messagingSenderId: '150033182319',
  appId: '1:150033182319:web:6a8850331798d9bd08279a',
  databaseURL: 'https://ultah-2e627-default-rtdb.asia-southeast1.firebasedatabase.app/',
};

let db = null;

try {
  const app = initializeApp(firebaseConfig);
  db = getDatabase(app);

  const connectionRef = ref(db, '.info/connected');
  onValue(
    connectionRef,
    function (snapshot) {
      const connected = snapshot.val() === true;
      console.info('Firebase connection status:', connected ? 'connected' : 'disconnected');
    },
    function (error) {
      console.error('Firebase connection monitor error:', error);
    }
  );
} catch (error) {
  console.warn('Firebase initialization skipped. Features requiring Firebase will not work.', error);
}

const FirebaseService = {
  saveWish: function (name, message) {
    if (!db) {
      return Promise.reject(new Error('Firebase not initialized'));
    }

    const wishRef = push(ref(db, 'wishes'));
    return set(wishRef, {
      name: name.trim(),
      message: message.trim(),
      timestamp: serverTimestamp(),
    });
  },

  getWishes: function (callback) {
    if (!db) {
      callback([]);
      return;
    }

    const wishesQuery = query(ref(db, 'wishes'), orderByChild('timestamp'), limitToLast(50));
    onValue(
      wishesQuery,
      function (snapshot) {
        const wishes = [];
        snapshot.forEach(function (childSnapshot) {
          wishes.unshift({
            id: childSnapshot.key,
            ...childSnapshot.val(),
          });
        });
        callback(wishes);
      },
      function (error) {
        console.error('Firebase getWishes failed:', error);
        callback([]);
      }
    );
  },

  saveRSVP: function (visitorId, status) {
    if (!db) {
      return Promise.reject(new Error('Firebase not initialized'));
    }

    return set(ref(db, `rsvp/${visitorId}`), {
      status: status,
      timestamp: serverTimestamp(),
    });
  },

  getRSVPSummary: function (callback) {
    if (!db) {
      callback({ going: 0, maybe: 0, declined: 0 });
      return;
    }

    onValue(
      ref(db, 'rsvp'),
      function (snapshot) {
        const summary = { going: 0, maybe: 0, declined: 0 };
        snapshot.forEach(function (childSnapshot) {
          const status = childSnapshot.val().status;
          if (status === 'going') summary.going++;
          else if (status === 'maybe') summary.maybe++;
          else if (status === 'declined') summary.declined++;
        });
        callback(summary);
      },
      function (error) {
        console.error('Firebase getRSVPSummary failed:', error);
        callback({ going: 0, maybe: 0, declined: 0 });
      }
    );
  },

  incrementVisitorCount: function () {
    if (!db) {
      return Promise.reject(new Error('Firebase not initialized'));
    }

    return runTransaction(ref(db, 'visitors/count'), function (current) {
      return (current || 0) + 1;
    });
  },

  getVisitorCount: function (callback) {
    if (!db) {
      callback(0);
      return;
    }

    onValue(
      ref(db, 'visitors/count'),
      function (snapshot) {
        callback(snapshot.val() || 0);
      },
      function (error) {
        console.error('Firebase getVisitorCount failed:', error);
        callback(0);
      }
    );
  },
};

export { FirebaseService };
