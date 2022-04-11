/**
 * @name getTimeRemaining
 * @param {Number} time
 * @param {Number} endtime
 * @returns {Object}
 */
export const getTimeRemaining = (time, endtime) => {
  const t = endtime - time;
  const seconds = `0${Math.floor((t / 1000) % 60)}`.slice(-2);
  const minutes = `0${Math.floor((t / 1000 / 60) % 60)}`.slice(-2);
  const hours = `0${Math.floor((t / (1000 * 60 * 60)) % 24)}`.slice(-2);
  const days = Math.floor(t / (1000 * 60 * 60 * 24));

  return {
    total: t,
    days,
    hours,
    minutes,
    seconds
  };
};
