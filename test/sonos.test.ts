import * as assert from "assert";
import { describe, it } from "mocha";
import * as nock from "nock";
import * as SONOS from "../index";
import * as Helpers from "../lib/helpers";

const Sonos = SONOS.Sonos;

const generateResponse = (
  responseTag: string,
  serviceName: string,
  responseBody?: string,
) => {
  const soapBody =
    "<u:" +
    responseTag +
    ' xmlns:u="urn:schemas-upnp-org:service:' +
    serviceName +
    ':1">' +
    (responseBody || null) +
    "</u:" +
    responseTag +
    ">";
  return Helpers.CreateSoapEnvelop(soapBody);
};

const mockRequest = (
  endpoint: string,
  action: string,
  requestBody: string,
  responseTag: string,
  serviceName: string,
  responseBody?: string,
) => {
  return nock("http://localhost:1400", { reqheaders: { soapaction: action } })
    .post(endpoint, (body: string) => {
      const fullBody = Helpers.CreateSoapEnvelop(requestBody);
      return body === fullBody;
    })
    .reply(200, generateResponse(responseTag, serviceName, responseBody));
};

describe("Sonos with TS-Node", () => {
  describe("play()", () => {
    it("should generate play command", () => {
      mockRequest(
        "/MediaRenderer/AVTransport/Control",
        '"urn:schemas-upnp-org:service:AVTransport:1#Play"',
        '<u:Play xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><Speed>1</Speed></u:Play>',
        "PlayResponse",
        "AVTransport",
      );
      const sonos = new Sonos("localhost", 1400);

      return sonos.play();
    });

    it("should accept a uri add => seek => play", () => {
      mockRequest(
        "/MediaRenderer/AVTransport/Control",
        '"urn:schemas-upnp-org:service:AVTransport:1#AddURIToQueue"',
        '<u:AddURIToQueue xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><EnqueuedURI>http://livingears.com/music/SceneNotHeard/091909/Do You Mind Kyla.mp3</EnqueuedURI><EnqueuedURIMetaData></EnqueuedURIMetaData><DesiredFirstTrackNumberEnqueued>0</DesiredFirstTrackNumberEnqueued><EnqueueAsNext>1</EnqueueAsNext></u:AddURIToQueue>',
        "AddURIToQueueResponse",
        "AVTransport",
        "<FirstTrackNumberEnqueued>1</FirstTrackNumberEnqueued><NewQueueLength>1</NewQueueLength><NumTracksAdded>1</NumTracksAdded>",
      );
      mockRequest(
        "/MediaRenderer/AVTransport/Control",
        '"urn:schemas-upnp-org:service:AVTransport:1#Seek"',
        '<u:Seek xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><Unit>TRACK_NR</Unit><Target>1</Target></u:Seek>',
        "SeekResponse",
        "AVTransport",
      );
      mockRequest(
        "/MediaRenderer/AVTransport/Control",
        '"urn:schemas-upnp-org:service:AVTransport:1#Play"',
        '<u:Play xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><Speed>1</Speed></u:Play>',
        "PlayResponse",
        "AVTransport",
      );
      const sonos = new Sonos("localhost", 1400);

      return sonos.play(
        "http://livingears.com/music/SceneNotHeard/091909/Do You Mind Kyla.mp3",
      );
    });

    it("should be able to accept an object instead of uri", () => {
      mockRequest(
        "/MediaRenderer/AVTransport/Control",
        '"urn:schemas-upnp-org:service:AVTransport:1#AddURIToQueue"',
        '<u:AddURIToQueue xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><EnqueuedURI>http://livingears.com/music/SceneNotHeard/091909/Do You Mind Kyla.mp3</EnqueuedURI><EnqueuedURIMetaData>test</EnqueuedURIMetaData><DesiredFirstTrackNumberEnqueued>0</DesiredFirstTrackNumberEnqueued><EnqueueAsNext>1</EnqueueAsNext></u:AddURIToQueue>',
        "AddURIToQueueResponse",
        "AVTransport",
        "<FirstTrackNumberEnqueued>1</FirstTrackNumberEnqueued><NewQueueLength>1</NewQueueLength><NumTracksAdded>1</NumTracksAdded>",
      );
      mockRequest(
        "/MediaRenderer/AVTransport/Control",
        '"urn:schemas-upnp-org:service:AVTransport:1#Seek"',
        '<u:Seek xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><Unit>TRACK_NR</Unit><Target>1</Target></u:Seek>',
        "SeekResponse",
        "AVTransport",
      );
      mockRequest(
        "/MediaRenderer/AVTransport/Control",
        '"urn:schemas-upnp-org:service:AVTransport:1#Play"',
        '<u:Play xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><Speed>1</Speed></u:Play>',
        "PlayResponse",
        "AVTransport",
      );
      const sonos = new Sonos("localhost", 1400);

      sonos.play({
        metadata: "test",
        uri:
          "http://livingears.com/music/SceneNotHeard/091909/Do You Mind Kyla.mp3",
      });
    });
  });

  describe("queue()", () => {
    it("should generate queue command", () => {
      mockRequest(
        "/MediaRenderer/AVTransport/Control",
        '"urn:schemas-upnp-org:service:AVTransport:1#AddURIToQueue"',
        '<u:AddURIToQueue xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><EnqueuedURI>http://livingears.com/music/SceneNotHeard/091909/Do You Mind Kyla.mp3</EnqueuedURI><EnqueuedURIMetaData></EnqueuedURIMetaData><DesiredFirstTrackNumberEnqueued>0</DesiredFirstTrackNumberEnqueued><EnqueueAsNext>1</EnqueueAsNext></u:AddURIToQueue>',
        "AddURIToQueueResponse",
        "AVTransport",
      );
      const sonos = new Sonos("localhost", 1400);

      return sonos.queue(
        "http://livingears.com/music/SceneNotHeard/091909/Do You Mind Kyla.mp3",
      );
    });

    it("should encode html characters in uri", () => {
      mockRequest(
        "/MediaRenderer/AVTransport/Control",
        '"urn:schemas-upnp-org:service:AVTransport:1#AddURIToQueue"',
        '<u:AddURIToQueue xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><EnqueuedURI>x-sonos-spotify:spotify%3atrack%3a01Bz4Mijhe7m7qRvq2Ujpn?sid=12&amp;flags=8224&amp;sn=2</EnqueuedURI><EnqueuedURIMetaData></EnqueuedURIMetaData><DesiredFirstTrackNumberEnqueued>0</DesiredFirstTrackNumberEnqueued><EnqueueAsNext>1</EnqueueAsNext></u:AddURIToQueue>',
        "AddURIToQueueResponse",
        "AVTransport",
      );
      const sonos = new Sonos("localhost", 1400);

      return sonos.queue(
        "x-sonos-spotify:spotify%3atrack%3a01Bz4Mijhe7m7qRvq2Ujpn?sid=12&flags=8224&sn=2",
      );
    });

    it("should accept object in place of uri", () => {
      mockRequest(
        "/MediaRenderer/AVTransport/Control",
        '"urn:schemas-upnp-org:service:AVTransport:1#AddURIToQueue"',
        '<u:AddURIToQueue xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><EnqueuedURI>http://livingears.com/music/SceneNotHeard/091909/Do You Mind Kyla.mp3</EnqueuedURI><EnqueuedURIMetaData>&lt;test&gt;&quot;hello&quot;&lt;/test&gt;</EnqueuedURIMetaData><DesiredFirstTrackNumberEnqueued>0</DesiredFirstTrackNumberEnqueued><EnqueueAsNext>1</EnqueueAsNext></u:AddURIToQueue>',
        "AddURIToQueueResponse",
        "AVTransport",
      );
      const sonos = new Sonos("localhost", 1400);

      return sonos.queue({
        metadata: '<test>"hello"</test>',
        uri:
          "http://livingears.com/music/SceneNotHeard/091909/Do You Mind Kyla.mp3",
      });
    });

    it("should accept a Spotify track uri", () => {
      mockRequest(
        "/MediaRenderer/AVTransport/Control",
        '"urn:schemas-upnp-org:service:AVTransport:1#AddURIToQueue"',
        '<u:AddURIToQueue xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><EnqueuedURI>x-sonos-spotify:spotify%3atrack%3a1AhDOtG9vPSOmsWgNW0BEY</EnqueuedURI><EnqueuedURIMetaData>&lt;DIDL-Lite xmlns:dc=&quot;http://purl.org/dc/elements/1.1/&quot; xmlns:upnp=&quot;urn:schemas-upnp-org:metadata-1-0/upnp/&quot; xmlns:r=&quot;urn:schemas-rinconnetworks-com:metadata-1-0/&quot; xmlns=&quot;urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/&quot;&gt;&lt;item id=&quot;00032020spotify%3atrack%3a1AhDOtG9vPSOmsWgNW0BEY&quot; restricted=&quot;true&quot;&gt;&lt;dc:title&gt;&lt;/dc:title&gt;&lt;upnp:class&gt;object.item.audioItem.musicTrack&lt;/upnp:class&gt;&lt;desc id=&quot;cdudn&quot; nameSpace=&quot;urn:schemas-rinconnetworks-com:metadata-1-0/&quot;&gt;SA_RINCON3079_X_#Svc3079-0-Token&lt;/desc&gt;&lt;/item&gt;&lt;/DIDL-Lite&gt;</EnqueuedURIMetaData><DesiredFirstTrackNumberEnqueued>0</DesiredFirstTrackNumberEnqueued><EnqueueAsNext>1</EnqueueAsNext></u:AddURIToQueue>',
        "AddURIToQueueResponse",
        "AVTransport",
      );
      const sonos = new Sonos("localhost", 1400);

      return sonos.queue("spotify:track:1AhDOtG9vPSOmsWgNW0BEY");
    });

    it("should accept a Spotify EU track uri", () => {
      mockRequest(
        "/MediaRenderer/AVTransport/Control",
        '"urn:schemas-upnp-org:service:AVTransport:1#AddURIToQueue"',
        '<u:AddURIToQueue xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><EnqueuedURI>x-sonos-spotify:spotify%3atrack%3a1AhDOtG9vPSOmsWgNW0BEY</EnqueuedURI><EnqueuedURIMetaData>&lt;DIDL-Lite xmlns:dc=&quot;http://purl.org/dc/elements/1.1/&quot; xmlns:upnp=&quot;urn:schemas-upnp-org:metadata-1-0/upnp/&quot; xmlns:r=&quot;urn:schemas-rinconnetworks-com:metadata-1-0/&quot; xmlns=&quot;urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/&quot;&gt;&lt;item id=&quot;00032020spotify%3atrack%3a1AhDOtG9vPSOmsWgNW0BEY&quot; restricted=&quot;true&quot;&gt;&lt;dc:title&gt;&lt;/dc:title&gt;&lt;upnp:class&gt;object.item.audioItem.musicTrack&lt;/upnp:class&gt;&lt;desc id=&quot;cdudn&quot; nameSpace=&quot;urn:schemas-rinconnetworks-com:metadata-1-0/&quot;&gt;SA_RINCON2311_X_#Svc2311-0-Token&lt;/desc&gt;&lt;/item&gt;&lt;/DIDL-Lite&gt;</EnqueuedURIMetaData><DesiredFirstTrackNumberEnqueued>0</DesiredFirstTrackNumberEnqueued><EnqueueAsNext>1</EnqueueAsNext></u:AddURIToQueue>',
        "AddURIToQueueResponse",
        "AVTransport",
      );
      const sonos = new Sonos("localhost", 1400);
      sonos.setSpotifyRegion(SONOS.SpotifyRegion.EU);

      return sonos.queue("spotify:track:1AhDOtG9vPSOmsWgNW0BEY");
    });

    it("should accept a Spotify album uri", () => {
      mockRequest(
        "/MediaRenderer/AVTransport/Control",
        '"urn:schemas-upnp-org:service:AVTransport:1#AddURIToQueue"',
        '<u:AddURIToQueue xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><EnqueuedURI>x-rincon-cpcontainer:0004206cspotify%3aalbum%3a1TSZDcvlPtAnekTaItI3qO</EnqueuedURI><EnqueuedURIMetaData>&lt;DIDL-Lite xmlns:dc=&quot;http://purl.org/dc/elements/1.1/&quot; xmlns:upnp=&quot;urn:schemas-upnp-org:metadata-1-0/upnp/&quot; xmlns:r=&quot;urn:schemas-rinconnetworks-com:metadata-1-0/&quot; xmlns=&quot;urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/&quot;&gt;&lt;item id=&quot;0004206cspotify%3aalbum%3a1TSZDcvlPtAnekTaItI3qO&quot; restricted=&quot;true&quot;&gt;&lt;dc:title&gt;&lt;/dc:title&gt;&lt;upnp:class&gt;object.container.album.musicAlbum&lt;/upnp:class&gt;&lt;desc id=&quot;cdudn&quot; nameSpace=&quot;urn:schemas-rinconnetworks-com:metadata-1-0/&quot;&gt;SA_RINCON3079_X_#Svc3079-0-Token&lt;/desc&gt;&lt;/item&gt;&lt;/DIDL-Lite&gt;</EnqueuedURIMetaData><DesiredFirstTrackNumberEnqueued>0</DesiredFirstTrackNumberEnqueued><EnqueueAsNext>1</EnqueueAsNext></u:AddURIToQueue>',
        "AddURIToQueueResponse",
        "AVTransport",
      );
      const sonos = new Sonos("localhost", 1400);

      sonos.queue("spotify:album:1TSZDcvlPtAnekTaItI3qO");
    });

    it("should accept a Spotify artist top tracks uri", () => {
      mockRequest(
        "/MediaRenderer/AVTransport/Control",
        '"urn:schemas-upnp-org:service:AVTransport:1#AddURIToQueue"',
        '<u:AddURIToQueue xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><EnqueuedURI>x-rincon-cpcontainer:000e206cspotify%3aartistTopTracks%3a1dfeR4HaWDbWqFHLkxsg1d</EnqueuedURI><EnqueuedURIMetaData>&lt;DIDL-Lite xmlns:dc=&quot;http://purl.org/dc/elements/1.1/&quot; xmlns:upnp=&quot;urn:schemas-upnp-org:metadata-1-0/upnp/&quot; xmlns:r=&quot;urn:schemas-rinconnetworks-com:metadata-1-0/&quot; xmlns=&quot;urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/&quot;&gt;&lt;item id=&quot;000e206cspotify%3aartistTopTracks%3a1dfeR4HaWDbWqFHLkxsg1d&quot; restricted=&quot;true&quot;&gt;&lt;dc:title&gt;&lt;/dc:title&gt;&lt;upnp:class&gt;object.container.playlistContainer&lt;/upnp:class&gt;&lt;desc id=&quot;cdudn&quot; nameSpace=&quot;urn:schemas-rinconnetworks-com:metadata-1-0/&quot;&gt;SA_RINCON3079_X_#Svc3079-0-Token&lt;/desc&gt;&lt;/item&gt;&lt;/DIDL-Lite&gt;</EnqueuedURIMetaData><DesiredFirstTrackNumberEnqueued>0</DesiredFirstTrackNumberEnqueued><EnqueueAsNext>1</EnqueueAsNext></u:AddURIToQueue>',
        "AddURIToQueueResponse",
        "AVTransport",
      );
      const sonos = new Sonos("localhost", 1400);

      sonos.queue("spotify:artistTopTracks:1dfeR4HaWDbWqFHLkxsg1d");
    });

    it("should accept a Spotify user public playlist uri", () => {
      mockRequest(
        "/MediaRenderer/AVTransport/Control",
        '"urn:schemas-upnp-org:service:AVTransport:1#AddURIToQueue"',
        '<u:AddURIToQueue xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><EnqueuedURI>x-rincon-cpcontainer:10062a6cspotify%3auser%3a26iFraqozskd5POrzg68pr?sid=9&amp;flags=10860&amp;sn=7</EnqueuedURI><EnqueuedURIMetaData>&lt;DIDL-Lite xmlns:dc=&quot;http://purl.org/dc/elements/1.1/&quot; xmlns:upnp=&quot;urn:schemas-upnp-org:metadata-1-0/upnp/&quot; xmlns:r=&quot;urn:schemas-rinconnetworks-com:metadata-1-0/&quot; xmlns=&quot;urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/&quot;&gt;&lt;item id=&quot;10062a6cspotify%3auser%3a26iFraqozskd5POrzg68pr&quot; parentID=&quot;10082664playlists&quot; restricted=&quot;true&quot;&gt;&lt;dc:title&gt;User playlist&lt;/dc:title&gt;&lt;upnp:class&gt;object.container.playlistContainer&lt;/upnp:class&gt;&lt;desc id=&quot;cdudn&quot; nameSpace=&quot;urn:schemas-rinconnetworks-com:metadata-1-0/&quot;&gt;SA_RINCON3079_X_#Svc3079-0-Token&lt;/desc&gt;&lt;/item&gt;&lt;/DIDL-Lite&gt;</EnqueuedURIMetaData><DesiredFirstTrackNumberEnqueued>0</DesiredFirstTrackNumberEnqueued><EnqueueAsNext>1</EnqueueAsNext></u:AddURIToQueue>',
        "AddURIToQueueResponse",
        "AVTransport",
      );
      const sonos = new Sonos("localhost", 1400);

      sonos.queue("spotify:user:26iFraqozskd5POrzg68pr");
    });

    it("should accept a Spotify EU user public playlist uri", () => {
      mockRequest(
        "/MediaRenderer/AVTransport/Control",
        '"urn:schemas-upnp-org:service:AVTransport:1#AddURIToQueue"',
        '<u:AddURIToQueue xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><EnqueuedURI>x-rincon-cpcontainer:10062a6cspotify%3auser%3a26iFraqozskd5POrzg68pr?sid=9&amp;flags=10860&amp;sn=7</EnqueuedURI><EnqueuedURIMetaData>&lt;DIDL-Lite xmlns:dc=&quot;http://purl.org/dc/elements/1.1/&quot; xmlns:upnp=&quot;urn:schemas-upnp-org:metadata-1-0/upnp/&quot; xmlns:r=&quot;urn:schemas-rinconnetworks-com:metadata-1-0/&quot; xmlns=&quot;urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/&quot;&gt;&lt;item id=&quot;10062a6cspotify%3auser%3a26iFraqozskd5POrzg68pr&quot; parentID=&quot;10082664playlists&quot; restricted=&quot;true&quot;&gt;&lt;dc:title&gt;User playlist&lt;/dc:title&gt;&lt;upnp:class&gt;object.container.playlistContainer&lt;/upnp:class&gt;&lt;desc id=&quot;cdudn&quot; nameSpace=&quot;urn:schemas-rinconnetworks-com:metadata-1-0/&quot;&gt;SA_RINCON2311_X_#Svc2311-0-Token&lt;/desc&gt;&lt;/item&gt;&lt;/DIDL-Lite&gt;</EnqueuedURIMetaData><DesiredFirstTrackNumberEnqueued>0</DesiredFirstTrackNumberEnqueued><EnqueueAsNext>1</EnqueueAsNext></u:AddURIToQueue>',
        "AddURIToQueueResponse",
        "AVTransport",
      );
      const sonos = new Sonos("localhost", 1400);
      sonos.setSpotifyRegion(SONOS.SpotifyRegion.EU);

      sonos.queue("spotify:user:26iFraqozskd5POrzg68pr");
    });
  });

  describe("playWithoutQueue()", () => {
    it("should accept a Spotify artist radio uri", () => {
      mockRequest(
        "/MediaRenderer/AVTransport/Control",
        '"urn:schemas-upnp-org:service:AVTransport:1#AddURIToQueue"',
        '<u:AddURIToQueue xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><EnqueuedURI>x-sonosapi-radio:spotify%3aartistRadio%3a1dfeR4HaWDbWqFHLkxsg1d?sid=12&amp;flags=8300&amp;sn=5</EnqueuedURI><EnqueuedURIMetaData>&lt;DIDL-Lite xmlns:dc=&quot;http://purl.org/dc/elements/1.1/&quot; xmlns:upnp=&quot;urn:schemas-upnp-org:metadata-1-0/upnp/&quot; xmlns:r=&quot;urn:schemas-rinconnetworks-com:metadata-1-0/&quot; xmlns=&quot;urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/&quot;&gt;&lt;item id=&quot;100c206cspotify%3aartistRadio%3a1dfeR4HaWDbWqFHLkxsg1d&quot; parentID=&quot;10052064spotify%3aartist%3a1dfeR4HaWDbWqFHLkxsg1d&quot; restricted=&quot;true&quot;&gt;&lt;dc:title&gt;Artist Radio&lt;/dc:title&gt;&lt;upnp:class&gt;object.item.audioItem.audioBroadcast.#artistRadio&lt;/upnp:class&gt;&lt;desc id=&quot;cdudn&quot; nameSpace=&quot;urn:schemas-rinconnetworks-com:metadata-1-0/&quot;&gt;SA_RINCON3079_X_#Svc3079-0-Token&lt;/desc&gt;&lt;/item&gt;&lt;/DIDL-Lite&gt;</EnqueuedURIMetaData><DesiredFirstTrackNumberEnqueued>0</DesiredFirstTrackNumberEnqueued><EnqueueAsNext>1</EnqueueAsNext></u:AddURIToQueue>',
        "AddURIToQueueResponse",
        "AVTransport",
      );
      const sonos = new Sonos("localhost", 1400);

      sonos.queue("spotify:artistRadio:1dfeR4HaWDbWqFHLkxsg1d");
    });

    it("should accept a Spotify EU artist radio uri", () => {
      mockRequest(
        "/MediaRenderer/AVTransport/Control",
        '"urn:schemas-upnp-org:service:AVTransport:1#AddURIToQueue"',
        '<u:AddURIToQueue xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><EnqueuedURI>x-sonosapi-radio:spotify%3aartistRadio%3a1dfeR4HaWDbWqFHLkxsg1d?sid=12&amp;flags=8300&amp;sn=5</EnqueuedURI><EnqueuedURIMetaData>&lt;DIDL-Lite xmlns:dc=&quot;http://purl.org/dc/elements/1.1/&quot; xmlns:upnp=&quot;urn:schemas-upnp-org:metadata-1-0/upnp/&quot; xmlns:r=&quot;urn:schemas-rinconnetworks-com:metadata-1-0/&quot; xmlns=&quot;urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/&quot;&gt;&lt;item id=&quot;100c206cspotify%3aartistRadio%3a1dfeR4HaWDbWqFHLkxsg1d&quot; parentID=&quot;10052064spotify%3aartist%3a1dfeR4HaWDbWqFHLkxsg1d&quot; restricted=&quot;true&quot;&gt;&lt;dc:title&gt;Artist Radio&lt;/dc:title&gt;&lt;upnp:class&gt;object.item.audioItem.audioBroadcast.#artistRadio&lt;/upnp:class&gt;&lt;desc id=&quot;cdudn&quot; nameSpace=&quot;urn:schemas-rinconnetworks-com:metadata-1-0/&quot;&gt;SA_RINCON2311_X_#Svc2311-0-Token&lt;/desc&gt;&lt;/item&gt;&lt;/DIDL-Lite&gt;</EnqueuedURIMetaData><DesiredFirstTrackNumberEnqueued>0</DesiredFirstTrackNumberEnqueued><EnqueueAsNext>1</EnqueueAsNext></u:AddURIToQueue>',
        "AddURIToQueueResponse",
        "AVTransport",
      );
      const sonos = new Sonos("localhost", 1400);
      sonos.setSpotifyRegion(SONOS.SpotifyRegion.EU);

      sonos.queue("spotify:artistRadio:1dfeR4HaWDbWqFHLkxsg1d");
    });
  });

  describe("playTuneinRadio()", () => {
    it("should generate play command", () => {
      mockRequest(
        "/MediaRenderer/AVTransport/Control",
        '"urn:schemas-upnp-org:service:AVTransport:1#SetAVTransportURI"',
        '<u:SetAVTransportURI xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><CurrentURI>x-sonosapi-stream:34682?sid=254&amp;flags=8224&amp;sn=0</CurrentURI><CurrentURIMetaData>&lt;DIDL-Lite xmlns:dc=&quot;http://purl.org/dc/elements/1.1/&quot; xmlns:upnp=&quot;urn:schemas-upnp-org:metadata-1-0/upnp/&quot; xmlns:r=&quot;urn:schemas-rinconnetworks-com:metadata-1-0/&quot; xmlns=&quot;urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/&quot;&gt;&lt;item id=&quot;F0009202034682&quot; parentID=&quot;L&quot; restricted=&quot;true&quot;&gt;&lt;dc:title&gt;88.5 | Jazz24 (Jazz)&lt;/dc:title&gt;&lt;upnp:class&gt;object.item.audioItem.audioBroadcast&lt;/upnp:class&gt;&lt;desc id=&quot;cdudn&quot; nameSpace=&quot;urn:schemas-rinconnetworks-com:metadata-1-0/&quot;&gt;SA_RINCON65031_&lt;/desc&gt;&lt;/item&gt;&lt;/DIDL-Lite&gt;</CurrentURIMetaData></u:SetAVTransportURI>',
        "SetAVTransportURIResponse",
        "AVTransport",
      );
      mockRequest(
        "/MediaRenderer/AVTransport/Control",
        '"urn:schemas-upnp-org:service:AVTransport:1#Play"',
        '<u:Play xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><Speed>1</Speed></u:Play>',
        "PlayResponse",
        "AVTransport",
      );
      const sonos = new Sonos("localhost", 1400);

      sonos.playTuneinRadio("34682", "88.5 | Jazz24 (Jazz)");
    });
  });

  describe("playSpotifyRadio()", () => {
    it("should generate play command", () => {
      mockRequest(
        "/MediaRenderer/AVTransport/Control",
        '"urn:schemas-upnp-org:service:AVTransport:1#SetAVTransportURI"',
        '<u:SetAVTransportURI xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><CurrentURI>x-sonosapi-radio:spotify%3aartistRadio%3a1dfeR4HaWDbWqFHLkxsg1d?sid=12&amp;flags=8300&amp;sn=5</CurrentURI><CurrentURIMetaData>&lt;DIDL-Lite xmlns:dc=&quot;http://purl.org/dc/elements/1.1/&quot; xmlns:upnp=&quot;urn:schemas-upnp-org:metadata-1-0/upnp/&quot; xmlns:r=&quot;urn:schemas-rinconnetworks-com:metadata-1-0/&quot; xmlns=&quot;urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/&quot;&gt;&lt;item id=&quot;100c206cspotify%3aartistRadio%3a1dfeR4HaWDbWqFHLkxsg1d&quot; parentID=&quot;10052064spotify%3aartist%3a1dfeR4HaWDbWqFHLkxsg1d&quot; restricted=&quot;true&quot;&gt;&lt;dc:title&gt;Queen&lt;/dc:title&gt;&lt;upnp:class&gt;object.item.audioItem.audioBroadcast.#artistRadio&lt;/upnp:class&gt;&lt;desc id=&quot;cdudn&quot; nameSpace=&quot;urn:schemas-rinconnetworks-com:metadata-1-0/&quot;&gt;SA_RINCON3079_X_#Svc3079-0-Token&lt;/desc&gt;&lt;/item&gt;&lt;/DIDL-Lite&gt;</CurrentURIMetaData></u:SetAVTransportURI>',
        "SetAVTransportURIResponse",
        "AVTransport",
      );
      mockRequest(
        "/MediaRenderer/AVTransport/Control",
        '"urn:schemas-upnp-org:service:AVTransport:1#Play"',
        '<u:Play xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><Speed>1</Speed></u:Play>',
        "PlayResponse",
        "AVTransport",
      );
      const sonos = new Sonos("localhost", 1400);

      sonos.playSpotifyRadio("1dfeR4HaWDbWqFHLkxsg1d", "Queen");
    });
  });

  describe("setAVTransportURI()", () => {
    it("should generate queue command", () => {
      mockRequest(
        "/MediaRenderer/AVTransport/Control",
        '"urn:schemas-upnp-org:service:AVTransport:1#SetAVTransportURI"',
        '<u:SetAVTransportURI xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><CurrentURI>http://livingears.com/music/SceneNotHeard/091909/Do You Mind Kyla.mp3</CurrentURI><CurrentURIMetaData></CurrentURIMetaData></u:SetAVTransportURI>',
        "SetAVTransportURIResponse",
        "AVTransport",
      );
      mockRequest(
        "/MediaRenderer/AVTransport/Control",
        '"urn:schemas-upnp-org:service:AVTransport:1#Play"',
        '<u:Play xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><Speed>1</Speed></u:Play>',
        "PlayResponse",
        "AVTransport",
      );
      const sonos = new Sonos("localhost", 1400);

      sonos.setAVTransportURI(
        "http://livingears.com/music/SceneNotHeard/091909/Do You Mind Kyla.mp3",
      );
    });

    it("should accept object in place of uri", () => {
      mockRequest(
        "/MediaRenderer/AVTransport/Control",
        '"urn:schemas-upnp-org:service:AVTransport:1#SetAVTransportURI"',
        '<u:SetAVTransportURI xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><CurrentURI>http://livingears.com/music/SceneNotHeard/091909/Do You Mind Kyla.mp3</CurrentURI><CurrentURIMetaData>&lt;test&gt;&quot;hello&quot;&lt;/test&gt;</CurrentURIMetaData></u:SetAVTransportURI>',
        "SetAVTransportURIResponse",
        "AVTransport",
      );
      mockRequest(
        "/MediaRenderer/AVTransport/Control",
        '"urn:schemas-upnp-org:service:AVTransport:1#Play"',
        '<u:Play xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><Speed>1</Speed></u:Play>',
        "PlayResponse",
        "AVTransport",
      );
      const sonos = new Sonos("localhost", 1400);

      sonos.setAVTransportURI({
        metadata: '<test>"hello"</test>',
        uri:
          "http://livingears.com/music/SceneNotHeard/091909/Do You Mind Kyla.mp3",
      });
    });
  });

  describe("createPlaylist()", () => {
    it("should create new playlist", async () => {
      const scope = mockRequest(
        "/MediaRenderer/AVTransport/Control",
        '"urn:schemas-upnp-org:service:AVTransport:1#CreateSavedQueue"',
        '<u:CreateSavedQueue xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><Title>Test</Title><EnqueuedURI></EnqueuedURI><EnqueuedURIMetaData></EnqueuedURIMetaData></u:CreateSavedQueue>',
        "CreateSavedQueue",
        "AVTransport",
      );

      const sonos = new Sonos("localhost", 1400);

      await sonos.createPlaylist("Test");
      scope.done();
    });
  });

  describe("deletePlaylist()", () => {
    it("should remove existing playlist", async () => {
      const scope = mockRequest(
        "/MediaServer/ContentDirectory/Control",
        '"urn:schemas-upnp-org:service:ContentDirectory:1#DestroyObject"',
        '<u:DestroyObject xmlns:u="urn:schemas-upnp-org:service:ContentDirectory:1"><ObjectID>SQ:5</ObjectID></u:DestroyObject>',
        "DestroyObject",
        "ContentDirectory",
      );

      const sonos = new Sonos("localhost", 1400);

      await sonos.deletePlaylist(5);
      scope.done();
    });
  });

  describe("addToPlaylist()", () => {
    it("should add track to playlist", async () => {
      mockRequest(
        "/MediaServer/ContentDirectory/Control",
        '"urn:schemas-upnp-org:service:ContentDirectory:1#Browse"',
        '<u:Browse xmlns:u="urn:schemas-upnp-org:service:ContentDirectory:1"><BrowseFlag>BrowseDirectChildren</BrowseFlag><Filter>*</Filter><StartingIndex>0</StartingIndex><RequestedCount>100</RequestedCount><SortCriteria></SortCriteria><ObjectID>SQ:1</ObjectID></u:Browse>',
        "BrowseResponse",
        "ContentDirectory",
        "<Result>&#x3C;DIDL-Lite xmlns:dc=&#x22;http://purl.org/dc/elements/1.1/&#x22; xmlns:upnp=&#x22;urn:schemas-upnp-org:metadata-1-0/upnp/&#x22; xmlns:r=&#x22;urn:schemas-rinconnetworks-com:metadata-1-0/&#x22; xmlns=&#x22;urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/&#x22;&#x3E;&#x3C;item id=&#x22;x-file-cifs://localhost/Music/Song.mp4&#x22; parentID=&#x22;SQ:1&#x22; restricted=&#x22;true&#x22;&#x3E;&#x3C;res protocolInfo=&#x22;x-file-cifs:*:audio/mp4:*&#x22;&#x3E;x-file-cifs://localhost/Music/Song.mp3&#x3C;/res&#x3E;&#x3C;upnp:albumArtURI&#x3E;&#x3C;/upnp:albumArtURI&#x3E;&#x3C;dc:title&#x3E;Song&#x3C;/dc:title&#x3E;&#x3C;upnp:class&#x3E;object.item.audioItem.musicTrack&#x3C;/upnp:class&#x3E;&#x3C;dc:creator&#x3E;MyInterpret&#x3C;/dc:creator&#x3E;&#x3C;upnp:album&#x3E;MyAlbum&#x3C;/upnp:album&#x3E;&#x3C;upnp:originalTrackNumber&#x3E;1&#x3C;/upnp:originalTrackNumber&#x3E;&#x3C;/item&#x3E;&#x3C;/DIDL-Lite&#x3E;</Result><NumberReturned>0</NumberReturned><TotalMatches>0</TotalMatches><UpdateID>0</UpdateID>",
      );
      const scope = mockRequest(
        "/MediaRenderer/AVTransport/Control",
        '"urn:schemas-upnp-org:service:AVTransport:1#AddURIToSavedQueue"',
        '<u:AddURIToSavedQueue xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><ObjectID>SQ:1</ObjectID><UpdateID>0</UpdateID><EnqueuedURI>x-file-cifs://localhost/Music/Song.mp3</EnqueuedURI><EnqueuedURIMetaData>&lt;DIDL-Lite xmlns:dc=&quot;http://purl.org/dc/elements/1.1/&quot; xmlns:upnp=&quot;urn:schemas-upnp-org:metadata-1-0/upnp/&quot; xmlns:r=&quot;urn:schemas-rinconnetworks-com:metadata-1-0/&quot; xmlns=&quot;urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/&quot;&gt;&lt;item id=&quot;S://localhost/Music/Song.mp3&quot; parentID=&quot;A:TRACKS&quot; restricted=&quot;true&quot;&gt;&lt;dc:title&gt;Song&lt;/dc:title&gt;&lt;upnp:class&gt;object.item.audioItem.musicTrack&lt;/upnp:class&gt;&lt;upnp:albumArtURI&gt;&lt;/upnp:albumArtURI&gt;&lt;desc id=&quot;cdudn&quot; nameSpace=&quot;urn:schemas-rinconnetworks-com:metadata-1-0/&quot;&gt;RINCON_AssociatedZPUDN&lt;/desc&gt;&lt;/item&gt;&lt;/DIDL-Lite&gt;</EnqueuedURIMetaData><AddAtIndex>4294967295</AddAtIndex></u:AddURIToSavedQueue>',
        "AddURIToSavedQueue",
        "AVTransport",
      );

      const sonos = new Sonos("localhost", 1400);

      await sonos.addToPlaylist("1", "x-file-cifs://localhost/Music/Song.mp3");
      scope.done();
    });

    it("should add album to playlist", async () => {
      mockRequest(
        "/MediaServer/ContentDirectory/Control",
        '"urn:schemas-upnp-org:service:ContentDirectory:1#Browse"',
        '<u:Browse xmlns:u="urn:schemas-upnp-org:service:ContentDirectory:1"><BrowseFlag>BrowseDirectChildren</BrowseFlag><Filter>*</Filter><StartingIndex>0</StartingIndex><RequestedCount>100</RequestedCount><SortCriteria></SortCriteria><ObjectID>SQ:1</ObjectID></u:Browse>',
        "BrowseResponse",
        "ContentDirectory",
        "<Result>&#x3C;DIDL-Lite xmlns:dc=&#x22;http://purl.org/dc/elements/1.1/&#x22; xmlns:upnp=&#x22;urn:schemas-upnp-org:metadata-1-0/upnp/&#x22; xmlns:r=&#x22;urn:schemas-rinconnetworks-com:metadata-1-0/&#x22; xmlns=&#x22;urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/&#x22;&#x3E;&#x3C;item id=&#x22;x-file-cifs://localhost/Music/Song.mp4&#x22; parentID=&#x22;SQ:1&#x22; restricted=&#x22;true&#x22;&#x3E;&#x3C;res protocolInfo=&#x22;x-file-cifs:*:audio/mp4:*&#x22;&#x3E;x-file-cifs://localhost/Music/Song.mp3&#x3C;/res&#x3E;&#x3C;upnp:albumArtURI&#x3E;&#x3C;/upnp:albumArtURI&#x3E;&#x3C;dc:title&#x3E;Song&#x3C;/dc:title&#x3E;&#x3C;upnp:class&#x3E;object.item.audioItem.musicTrack&#x3C;/upnp:class&#x3E;&#x3C;dc:creator&#x3E;MyInterpret&#x3C;/dc:creator&#x3E;&#x3C;upnp:album&#x3E;MyAlbum&#x3C;/upnp:album&#x3E;&#x3C;upnp:originalTrackNumber&#x3E;1&#x3C;/upnp:originalTrackNumber&#x3E;&#x3C;/item&#x3E;&#x3C;/DIDL-Lite&#x3E;</Result><NumberReturned>0</NumberReturned><TotalMatches>0</TotalMatches><UpdateID>0</UpdateID>",
      );
      const scope = mockRequest(
        "/MediaRenderer/AVTransport/Control",
        '"urn:schemas-upnp-org:service:AVTransport:1#AddURIToSavedQueue"',
        '<u:AddURIToSavedQueue xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><ObjectID>SQ:1</ObjectID><UpdateID>0</UpdateID><EnqueuedURI>x-rincon-playlist://localhost/Music/Album#A:ALBUMS/MyAlbum</EnqueuedURI><EnqueuedURIMetaData>&lt;DIDL-Lite xmlns:dc=&quot;http://purl.org/dc/elements/1.1/&quot; xmlns:upnp=&quot;urn:schemas-upnp-org:metadata-1-0/upnp/&quot; xmlns:r=&quot;urn:schemas-rinconnetworks-com:metadata-1-0/&quot; xmlns=&quot;urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/&quot;&gt;&lt;item id=&quot;A:ALBUMS/MyAlbum&quot; parentID=&quot;A:ALBUMS&quot; restricted=&quot;true&quot;&gt;&lt;dc:title&gt;MyAlbum&lt;/dc:title&gt;&lt;upnp:class&gt;object.item.audioItem.musicAlbum&lt;/upnp:class&gt;&lt;upnp:albumArtURI&gt;&lt;/upnp:albumArtURI&gt;&lt;desc id=&quot;cdudn&quot; nameSpace=&quot;urn:schemas-rinconnetworks-com:metadata-1-0/&quot;&gt;RINCON_AssociatedZPUDN&lt;/desc&gt;&lt;/item&gt;&lt;/DIDL-Lite&gt;</EnqueuedURIMetaData><AddAtIndex>4294967295</AddAtIndex></u:AddURIToSavedQueue>',
        "AddURIToSavedQueue",
        "AVTransport",
      );

      const sonos = new Sonos("localhost", 1400);

      await sonos.addToPlaylist(
        "1",
        "x-rincon-playlist://localhost/Music/Album#A:ALBUMS/MyAlbum",
      );
      scope.done();
    });

    it("should add albumartist to playlist", async () => {
      mockRequest(
        "/MediaServer/ContentDirectory/Control",
        '"urn:schemas-upnp-org:service:ContentDirectory:1#Browse"',
        '<u:Browse xmlns:u="urn:schemas-upnp-org:service:ContentDirectory:1"><BrowseFlag>BrowseDirectChildren</BrowseFlag><Filter>*</Filter><StartingIndex>0</StartingIndex><RequestedCount>100</RequestedCount><SortCriteria></SortCriteria><ObjectID>SQ:1</ObjectID></u:Browse>',
        "BrowseResponse",
        "ContentDirectory",
        "<Result>&#x3C;DIDL-Lite xmlns:dc=&#x22;http://purl.org/dc/elements/1.1/&#x22; xmlns:upnp=&#x22;urn:schemas-upnp-org:metadata-1-0/upnp/&#x22; xmlns:r=&#x22;urn:schemas-rinconnetworks-com:metadata-1-0/&#x22; xmlns=&#x22;urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/&#x22;&#x3E;&#x3C;item id=&#x22;x-file-cifs://localhost/Music/Song.mp4&#x22; parentID=&#x22;SQ:1&#x22; restricted=&#x22;true&#x22;&#x3E;&#x3C;res protocolInfo=&#x22;x-file-cifs:*:audio/mp4:*&#x22;&#x3E;x-file-cifs://localhost/Music/Song.mp3&#x3C;/res&#x3E;&#x3C;upnp:albumArtURI&#x3E;&#x3C;/upnp:albumArtURI&#x3E;&#x3C;dc:title&#x3E;Song&#x3C;/dc:title&#x3E;&#x3C;upnp:class&#x3E;object.item.audioItem.musicTrack&#x3C;/upnp:class&#x3E;&#x3C;dc:creator&#x3E;MyInterpret&#x3C;/dc:creator&#x3E;&#x3C;upnp:album&#x3E;MyAlbum&#x3C;/upnp:album&#x3E;&#x3C;upnp:originalTrackNumber&#x3E;1&#x3C;/upnp:originalTrackNumber&#x3E;&#x3C;/item&#x3E;&#x3C;/DIDL-Lite&#x3E;</Result><NumberReturned>0</NumberReturned><TotalMatches>0</TotalMatches><UpdateID>0</UpdateID>",
      );
      const scope = mockRequest(
        "/MediaRenderer/AVTransport/Control",
        '"urn:schemas-upnp-org:service:AVTransport:1#AddURIToSavedQueue"',
        '<u:AddURIToSavedQueue xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><ObjectID>SQ:1</ObjectID><UpdateID>0</UpdateID><EnqueuedURI>x-rincon-playlist://localhost/Music/AlbumArtist#A:ALBUMARTIST/My Album Artist</EnqueuedURI><EnqueuedURIMetaData>&lt;DIDL-Lite xmlns:dc=&quot;http://purl.org/dc/elements/1.1/&quot; xmlns:upnp=&quot;urn:schemas-upnp-org:metadata-1-0/upnp/&quot; xmlns:r=&quot;urn:schemas-rinconnetworks-com:metadata-1-0/&quot; xmlns=&quot;urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/&quot;&gt;&lt;item id=&quot;A:ALBUMARTIST/My%20Album%20Artist&quot; parentID=&quot;A:ALBUMARTIST&quot; restricted=&quot;true&quot;&gt;&lt;dc:title&gt;My Album Artist&lt;/dc:title&gt;&lt;upnp:class&gt;object.item.audioItem.musicArtist&lt;/upnp:class&gt;&lt;upnp:albumArtURI&gt;&lt;/upnp:albumArtURI&gt;&lt;desc id=&quot;cdudn&quot; nameSpace=&quot;urn:schemas-rinconnetworks-com:metadata-1-0/&quot;&gt;RINCON_AssociatedZPUDN&lt;/desc&gt;&lt;/item&gt;&lt;/DIDL-Lite&gt;</EnqueuedURIMetaData><AddAtIndex>4294967295</AddAtIndex></u:AddURIToSavedQueue>',
        "AddURIToSavedQueue",
        "AVTransport",
      );

      const sonos = new Sonos("localhost", 1400);

      await sonos.addToPlaylist(
        "1",
        "x-rincon-playlist://localhost/Music/AlbumArtist#A:ALBUMARTIST/My Album Artist",
      );
      scope.done();
    });

    it("should add genre to playlist", async () => {
      mockRequest(
        "/MediaServer/ContentDirectory/Control",
        '"urn:schemas-upnp-org:service:ContentDirectory:1#Browse"',
        '<u:Browse xmlns:u="urn:schemas-upnp-org:service:ContentDirectory:1"><BrowseFlag>BrowseDirectChildren</BrowseFlag><Filter>*</Filter><StartingIndex>0</StartingIndex><RequestedCount>100</RequestedCount><SortCriteria></SortCriteria><ObjectID>SQ:1</ObjectID></u:Browse>',
        "BrowseResponse",
        "ContentDirectory",
        "<Result>&#x3C;DIDL-Lite xmlns:dc=&#x22;http://purl.org/dc/elements/1.1/&#x22; xmlns:upnp=&#x22;urn:schemas-upnp-org:metadata-1-0/upnp/&#x22; xmlns:r=&#x22;urn:schemas-rinconnetworks-com:metadata-1-0/&#x22; xmlns=&#x22;urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/&#x22;&#x3E;&#x3C;item id=&#x22;x-file-cifs://localhost/Music/Song.mp4&#x22; parentID=&#x22;SQ:1&#x22; restricted=&#x22;true&#x22;&#x3E;&#x3C;res protocolInfo=&#x22;x-file-cifs:*:audio/mp4:*&#x22;&#x3E;x-file-cifs://localhost/Music/Song.mp3&#x3C;/res&#x3E;&#x3C;upnp:albumArtURI&#x3E;&#x3C;/upnp:albumArtURI&#x3E;&#x3C;dc:title&#x3E;Song&#x3C;/dc:title&#x3E;&#x3C;upnp:class&#x3E;object.item.audioItem.musicTrack&#x3C;/upnp:class&#x3E;&#x3C;dc:creator&#x3E;MyInterpret&#x3C;/dc:creator&#x3E;&#x3C;upnp:album&#x3E;MyAlbum&#x3C;/upnp:album&#x3E;&#x3C;upnp:originalTrackNumber&#x3E;1&#x3C;/upnp:originalTrackNumber&#x3E;&#x3C;/item&#x3E;&#x3C;/DIDL-Lite&#x3E;</Result><NumberReturned>0</NumberReturned><TotalMatches>0</TotalMatches><UpdateID>0</UpdateID>",
      );
      const scope = mockRequest(
        "/MediaRenderer/AVTransport/Control",
        '"urn:schemas-upnp-org:service:AVTransport:1#AddURIToSavedQueue"',
        '<u:AddURIToSavedQueue xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><ObjectID>SQ:1</ObjectID><UpdateID>0</UpdateID><EnqueuedURI>x-rincon-playlist://localhost/Music/Genre#A:GENRE/MyGenre</EnqueuedURI><EnqueuedURIMetaData>&lt;DIDL-Lite xmlns:dc=&quot;http://purl.org/dc/elements/1.1/&quot; xmlns:upnp=&quot;urn:schemas-upnp-org:metadata-1-0/upnp/&quot; xmlns:r=&quot;urn:schemas-rinconnetworks-com:metadata-1-0/&quot; xmlns=&quot;urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/&quot;&gt;&lt;item id=&quot;A:GENRE/MyGenre&quot; parentID=&quot;A:GENRE&quot; restricted=&quot;true&quot;&gt;&lt;dc:title&gt;MyGenre&lt;/dc:title&gt;&lt;upnp:class&gt;object.container.genre.musicGenre&lt;/upnp:class&gt;&lt;upnp:albumArtURI&gt;&lt;/upnp:albumArtURI&gt;&lt;desc id=&quot;cdudn&quot; nameSpace=&quot;urn:schemas-rinconnetworks-com:metadata-1-0/&quot;&gt;RINCON_AssociatedZPUDN&lt;/desc&gt;&lt;/item&gt;&lt;/DIDL-Lite&gt;</EnqueuedURIMetaData><AddAtIndex>4294967295</AddAtIndex></u:AddURIToSavedQueue>',
        "AddURIToSavedQueue",
        "AVTransport",
      );
      const sonos = new Sonos("localhost", 1400);

      await sonos.addToPlaylist(
        "1",
        "x-rincon-playlist://localhost/Music/Genre#A:GENRE/MyGenre",
      );
      scope.done();
    });
  });

  describe("removeFromPlaylist()", () => {
    it("should remove track from playlist", async () => {
      mockRequest(
        "/MediaServer/ContentDirectory/Control",
        '"urn:schemas-upnp-org:service:ContentDirectory:1#Browse"',
        '<u:Browse xmlns:u="urn:schemas-upnp-org:service:ContentDirectory:1"><BrowseFlag>BrowseDirectChildren</BrowseFlag><Filter>*</Filter><StartingIndex>0</StartingIndex><RequestedCount>100</RequestedCount><SortCriteria></SortCriteria><ObjectID>SQ:1</ObjectID></u:Browse>',
        "BrowseResponse",
        "ContentDirectory",
        "<Result>&#x3C;DIDL-Lite xmlns:dc=&#x22;http://purl.org/dc/elements/1.1/&#x22; xmlns:upnp=&#x22;urn:schemas-upnp-org:metadata-1-0/upnp/&#x22; xmlns:r=&#x22;urn:schemas-rinconnetworks-com:metadata-1-0/&#x22; xmlns=&#x22;urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/&#x22;&#x3E;&#x3C;item id=&#x22;x-file-cifs://localhost/Music/Song.mp4&#x22; parentID=&#x22;SQ:1&#x22; restricted=&#x22;true&#x22;&#x3E;&#x3C;res protocolInfo=&#x22;x-file-cifs:*:audio/mp4:*&#x22;&#x3E;x-file-cifs://localhost/Music/Song.mp3&#x3C;/res&#x3E;&#x3C;upnp:albumArtURI&#x3E;&#x3C;/upnp:albumArtURI&#x3E;&#x3C;dc:title&#x3E;Song&#x3C;/dc:title&#x3E;&#x3C;upnp:class&#x3E;object.item.audioItem.musicTrack&#x3C;/upnp:class&#x3E;&#x3C;dc:creator&#x3E;MyInterpret&#x3C;/dc:creator&#x3E;&#x3C;upnp:album&#x3E;MyAlbum&#x3C;/upnp:album&#x3E;&#x3C;upnp:originalTrackNumber&#x3E;1&#x3C;/upnp:originalTrackNumber&#x3E;&#x3C;/item&#x3E;&#x3C;/DIDL-Lite&#x3E;</Result><NumberReturned>0</NumberReturned><TotalMatches>0</TotalMatches><UpdateID>0</UpdateID>",
      );
      const scope = mockRequest(
        "/MediaRenderer/AVTransport/Control",
        '"urn:schemas-upnp-org:service:AVTransport:1#ReorderTracksInSavedQueue"',
        '<u:ReorderTracksInSavedQueue xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><ObjectID>SQ:1</ObjectID><UpdateID>0</UpdateID><TrackList>2</TrackList><NewPositionList></NewPositionList></u:ReorderTracksInSavedQueue>',
        "ReorderTracksInSavedQueue",
        "AVTransport",
      );

      const sonos = new Sonos("localhost", 1400);

      await sonos.removeFromPlaylist(1, 2);
      scope.done();
    });
  });
});

describe("DeviceDiscovery", () => {
  it("should emit a timeout event when timeout is hit", (done) => {
    const failTimeout = setTimeout(() => {
      assert(false, "Event never fired");
      done();
    }, 100);

    const search = SONOS.DeviceDiscovery(
      { timeout: 10 },
      (device, model) => {},
    );
    search.on("timeout", () => {
      clearTimeout(failTimeout);
      assert(true);
      done();
    });
  });

  it("should not emit a timeout event when no timeout option is passed in", (done) => {
    setTimeout(() => {
      assert(true);
      done();
    }, 10);

    const search = SONOS.DeviceDiscovery((device: any, model: any) => {});

    search.on("timeout", () => {
      assert(false, "Timeout event should never fire");
      done();
    });
  });

  it("should not emit a timeout event after search is stopped", (done) => {
    const search = SONOS.DeviceDiscovery(
      { timeout: 10 },
      (device, model) => {},
    );

    search.on("timeout", () => {
      assert(false, "Timeout event should never fire");
      done();
    });
    search.destroy(() => {
      assert(true);
      done();
    });
  });
});

describe("SonosDevice", () => {
  let sonos: SONOS.Sonos;
  before(async function() {
    if (!process.env.SONOS_HOST) {
      this.skip();
    } else {
      sonos = new Sonos(process.env.SONOS_HOST, 1400);
    }
    // Create playlist for unit testing
    // NOTE: Sonos will create new id for this, so don't delete if testing alot
    const playList = await sonos.getMusicLibrary("sonos_playlists");
    if (!playList.items.find((i) => i.title === "_unit_testing_")) {
      const playListElement = await sonos.createPlaylist("_unit_testing_");
      const trackEntity = await sonos.getMusicLibrary("tracks", { total: 1 });
      if (parseInt(trackEntity.returned, 10) < 1) {
        this.skip(); // as no tracks found
      }
      await sonos.addToPlaylist(
        playListElement.AssignedObjectID.split(":")[1],
        trackEntity.items[0].uri,
      );
    }
  });

  it("should getMuted()", () => {
    return sonos.getMuted().then((muted) => {
      assert(typeof muted === "boolean", "muted is a boolean");
    });
  });

  it("should getCurrentState()", () => {
    return sonos.getCurrentState().then((state) => {
      assert(typeof state === "string", "state is a string");
      const values = [
        "stopped",
        "playing",
        "paused",
        "transitioning",
        "no_media",
      ];
      assert(values.indexOf(state) > -1, "state is one of the allowed values");
    });
  });

  it("should getVolume()", () => {
    return sonos.getVolume().then((volume) => {
      assert(typeof volume === "number", "volume is a number");
      assert(volume >= 0 && volume <= 100, "volume is between 0 and 100");
    });
  });

  it("should getPlayMode()", () => {
    return sonos.getPlayMode().then((playmode) => {
      assert(typeof playmode === "string", "playmode is a string");
      const values = [
        "NORMAL",
        "REPEAT_ONE",
        "REPEAT_ALL",
        "SHUFFLE",
        "SHUFFLE_NOREPEAT",
        "SHUFFLE_REPEAT_ONE",
      ];
      assert(
        values.indexOf(playmode) > -1,
        "playmode is one of the allowed values",
      );
    });
  });

  it("should getFavorites()", () => {
    return sonos.getFavorites().then((favs) => {
      assert(favs.items, "should have items");
    });
  });

  it("should getPlaylist()", () => {
    return sonos.getMusicLibrary("sonos_playlists").then((playlists) => {
      const thePlaylist = playlists.items.find(
        (i) => i.title === "_unit_testing_",
      );
      if (!thePlaylist) {
        throw new Error("no playlist found???");
      }
      return sonos.getPlaylist(thePlaylist.id).then((playlist) => {
        assert(playlist.items, "should have items");
      });
    });
  });

  it("should getQueue()", () => {
    return sonos.getQueue().then((queue) => {
      assert(queue.items, "should have items");
    });
  });

  // There seem to be some kind of error here.... Needs attention.
  it("should getFavoritesRadioStations()", () => {
    return sonos.getFavoritesRadioStations().then((radio) => {
      assert(radio.items, "should have items");
    });
  });

  it("should getAllGroups()", () => {
    return sonos.getAllGroups().then((groups) => {
      assert(Array.isArray(groups), "should return an array");
    });
  });
  after(async function() {
    if (!process.env.SONOS_HOST) {
      this.skip();
    } else {
      // console.log( await sonos.getMusicLibrary('playlist'));
    }
  });
});