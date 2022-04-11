// Search based on scoring by searching array -> more items of array match ->
// the higher the score. Last step -> sort array by relevance
import { _ } from "meteor/underscore";

class DirectorySearch {
  constructor({ accountId, filter, limit }) {
    this.accountId = accountId;
    this.filter = filter;
    this.limit = limit || 10;
    this.pipeline = [];

    this.fields = {
      _id: 1,
      id: "$_id",
      name: 1,
      description: 1,
      logo: 1,
      profile: 1,
      isFavorite: 1,
      partnership: 1,
      shortlistedBy: 1,
      featuredProfile: 1 // pull accounts first by using this field. set score from 0 to 10
    };

    return this;
  }

  search() {
    this.pipeline.push({
      $match: {
        deleted: false,
        type: "carrier",
        profile: { $exists: true },
        ...(this.filter.partners
          ? { "partners.accountId": this.accountId }
          : undefined),
        ...(this.filter.favorites
          ? { shortlistedBy: this.accountId }
          : undefined)
      }
    });
    return this;
  }

  filterOnName() {
    if (this.filter.name && this.filter.name.length >= 3) {
      this.pipeline.push({
        $match: {
          name: {
            $regex: this.filter.name,
            $options: "i"
          }
        }
      });
    }
    return this;
  }

  filterOnService() {
    if (this.filter.service != null) {
      // Match at least one of the filters
      this.pipeline.push({
        $match: {
          "profile.services": {
            $in: this.filter.service
          }
        }
      });
      this.pipeline.push({
        $project: {
          ...this.fields,
          serviceScore: {
            $let: {
              vars: {
                matchSize: {
                  $size: {
                    $setIntersection: ["$profile.services", this.filter.service]
                  }
                }
              },
              in: {
                $add: [
                  "$$matchSize",
                  {
                    $cond: [
                      {
                        $eq: [
                          "$$matchSize",
                          {
                            $size: "$profile.services"
                          }
                        ]
                      },
                      "$$matchSize",
                      0
                    ]
                  }
                ]
              }
            }
          }
        }
      });
    }
    return this;
  }

  filterOnCertificate() {
    if (this.filter.certificate != null) {
      // Match at least one of the filters
      this.pipeline.push({
        $match: {
          "profile.certificates": {
            $in: this.filter.certificate
          }
        }
      });
      this.pipeline.push({
        $project: {
          ...this.fields,
          serviceScore: {
            $let: {
              vars: {
                matchSize: {
                  $size: {
                    $setIntersection: [
                      "$profile.certificates",
                      this.filter.certificate
                    ]
                  }
                }
              },
              in: {
                $add: [
                  "$$matchSize",
                  {
                    $cond: [
                      {
                        $eq: [
                          "$$matchSize",
                          {
                            $size: "$profile.certificates"
                          }
                        ]
                      },
                      "$$matchSize",
                      0
                    ]
                  }
                ]
              }
            }
          }
        }
      });
    }
    return this;
  }

  filterOnLane() {
    const { destination } = this.filter;
    if (destination && destination.length > 0) {
      _.each(destination, country => {
        return this.pipeline.push({
          $match: {
            "profile.footprint": country
          }
        });
      });
    }
    const { location } = this.filter;
    if (location && destination.length > 0) {
      _.each(location, country => {
        return this.pipeline.push({
          $match: {
            "profile.locations.country": new RegExp(country, "i")
          }
        });
      });
    }
    return this;
  }

  rankResults() {
    // Add up all scores
    this.pipeline.push({
      $project: {
        ...this.fields,

        totalScore: {
          $sum: ["$serviceScore", "$certificateScore"]
        }
      }
    });

    // Sort by relevance
    this.pipeline.push({
      $sort: {
        totalScore: -1,
        featuredProfile: -1,
        _id: 1
      }
    });

    return this;
  }

  limitResults() {
    // Limit (+1 so we know if there is more where this came from)
    this.pipeline.push({
      $limit: this.limit + 1
    });
    return this;
  }

  get() {
    return this.pipeline;
  }
}

export { DirectorySearch };
