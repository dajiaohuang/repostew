# riatelab/magrit

Apply these lessons only within the cited scope; recheck current feedback and source before future work.
See the [reference scope](../README.md).

- For standardized-residual class breaks, the selected limits affect which break intervals are valid. The maintainer rejected sorting the default breaks as a fix when `minStdRes` exceeds -1.5 or `maxStdRes` is below 1.5; generate breaks appropriate to the requested range instead. This rejects that specific implementation, not every class-break change. [Feedback](https://github.com/riatelab/magrit/pull/239#issuecomment-5997369946).
