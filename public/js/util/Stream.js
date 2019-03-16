var Stream,
  hasProp = {}.hasOwnProperty;

import Util from '../util/Util.js';

// Stream   is standalone base class for all publish and subscribe steams
// StreamRx extends Stream for RxJS
// SteamsXs extends Stream for xstream
Stream = class Stream {
  constructor(subjectNames, info) {
    var i, len, ref, subjectName;
    this.subjectNames = subjectNames;
    this.info = info;
    this.subjects = {};
    ref = this.subjectNames;
    for (i = 0, len = ref.length; i < len; i++) {
      subjectName = ref[i];
      this.addSubject(subjectName);
    }
    Util.noop(this.allInfo);
  }

  subscribe(subjectName, subscriberName, onCallback) {
    var subject;
    subject = this.getSubject(subjectName, false);
    subject['subscribers'][subscriberName] = onCallback;
    if (this.isInfo(subjectName, 'subscribe')) {
      console.info('Strean.subscribe()', {
        subject: subjectName,
        subscriber: subscriberName
      });
    }
  }

  publish(subjectName, object) {
    var onCallback, ref, subject, subscriberName;
    subject = this.getSubject(subjectName, false);
    ref = subject['subscribers'];
    for (subscriberName in ref) {
      if (!hasProp.call(ref, subscriberName)) continue;
      onCallback = ref[subscriberName];
      onCallback(object);
    }
    if (this.isInfo(subjectName, 'publish')) {
      console.info('Stream.publish()', {
        subject: subjectName,
        object: object
      });
    }
  }

  event(subjectName, object, element, eventType) {
    var onEvent;
    onEvent = (event) => {
      if (event != null) {
        event.stopPropagation();
      }
      if (event != null) {
        event.preventDefault();
      }
      this.publish(subjectName, object);
    };
    element.addEventListener(eventType, onEvent);
  }

  complete(subjectName, object, completeName, onComplete, completeObject) {
    var onCallback, onSubscribe, ref, ref1, subject, subscriberName;
    subject = this.getSubject(subjectName, false);
    subject[completeName] = {};
    ref = subject['subscribers'];
    for (subscriberName in ref) {
      if (!hasProp.call(ref, subscriberName)) continue;
      onCallback = ref[subscriberName];
      subject[completeName][subscriberName] = false;
    }
    ref1 = subject['subscribers'];
    for (subscriberName in ref1) {
      if (!hasProp.call(ref1, subscriberName)) continue;
      onCallback = ref1[subscriberName];
      onSubscribe = (object) => {
        onCallback(object);
        subject[completeName][subscriberName] = true;
        if (this.isComplete(subject, completeName)) {
          onComplete(completeObject);
          if (this.isInfo(subjectName, 'complete')) {
            return console.info('Stream.complete()', {
              subject: subjectName,
              object: object,
              complete: completeName,
              completeObject: completeObject
            });
          }
        }
      };
      onSubscribe(object);
    }
  }

  isComplete(subject, completeName) {
    var ref, status, subscriberName;
    ref = subject[completeName];
    for (subscriberName in ref) {
      if (!hasProp.call(ref, subscriberName)) continue;
      status = ref[subscriberName];
      if (status === false) {
        return false;
      }
    }
    return true;
  }

  unsubscribe(subjectName, subscriberName) {
    if (this.hasSubject(subjectName)) {
      if (this.hasSubscriber(subjectName, subscriberName)) {
        delete this.subjects[subjectName].subscribers[subscriberName];
      } else {
        console.error('Strean.unsubscribe() unknown subscriber', {
          subject: subjectName,
          subscriber: subscriberName
        });
      }
    } else {
      console.error('Strean.unsubscribe() unknown subject', {
        subject: subjectName,
        subscriber: subscriberName
      });
    }
    if (this.isInfo(subjectName, 'subscribe')) {
      console.info('Stream.unsubscribe()', {
        subject: subjectName,
        subscriber: subscriberName
      });
    }
  }

  unsubscribeAll() {
    var onCallback, ref, ref1, subject, subjectName, subscriberName;
    ref = this.subjects;
    for (subjectName in ref) {
      if (!hasProp.call(ref, subjectName)) continue;
      subject = ref[subjectName];
      ref1 = subject['subscribers'];
      for (subscriberName in ref1) {
        if (!hasProp.call(ref1, subscriberName)) continue;
        onCallback = ref1[subscriberName];
        this.unsubscribe(subjectName, subscriberName);
      }
    }
  }

  addSubject(subjectName, warn = true) {
    var subject;
    if (!this.hasSubject(subjectName)) {
      subject = {};
      subject['subscribers'] = {};
      this.subjects[subjectName] = subject;
    } else {
      if (warn) {
        console.warn('Stream.addSubject() subject already exists', subjectName);
      }
    }
  }

  hasSubject(subjectName) {
    return this.subjects[subjectName] != null;
  }

  hasSubscriber(subjectName, subscriberName) {
    return this.hasSubject(subjectName) && (this.subjects[subjectName]['subscribers'][subscriberName] != null);
  }

  // Get a subject by name. Create a new one if need with a warning
  getSubject(subjectName, warn = true) {
    if (!this.hasSubject(subjectName)) {
      if (warn) {
        console.warn('Stream.getSubject() unknown name for subject so creating one for', subjectName);
      }
      this.addSubject(subjectName, false);
    }
    return this.subjects[subjectName];
  }

  isInfo(subjectName, op) {
    return Util.inArray(this.info.subjects, subjectName) && (this.info[op] != null) && this.info[op];
  }

  allInfo() {
    var ref, ref1, subject, subjectName, subscriber, subscriberName;
    console.info('--- Stream.Subjects --- ');
    ref = this.subjects;
    for (subjectName in ref) {
      if (!hasProp.call(ref, subjectName)) continue;
      subject = ref[subjectName];
      console.info(`  Subject ${subjectName}`);
      ref1 = subject.subscribers;
      for (subscriberName in ref1) {
        if (!hasProp.call(ref1, subscriberName)) continue;
        subscriber = ref1[subscriberName];
        console.info(`    Subscriber ${subscriberName}`);
      }
    }
  }

};

export default Stream;
