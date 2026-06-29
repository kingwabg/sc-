/**
 * Daily Log — Mock Data
 * HTML template based on the provided government childcare center daily log format.
 */
import type { DailyLog } from "./types";

function makeLogHtml(params: {
  date: string;
  dayLabel: string;
  hours: string;
  author: string;
  maleYuch: string; maleChul: string; maleJolse: string; maleJong: string;
  femaleYuch: string; femaleChul: string; femaleJolse: string; femaleJong: string;
  jeongwon: string; hyenwon: string; chulgeuk: string; daeche: string; gyelsok: string; gita: string;
  joSik: string; jungSik: string; seokSik: string;
  staffJong: string; staffGyo: string; staffGong: string; staffGita: string;
  gyosilChulgin: string;
  absentNames: string;
  visitorInfo: string;
  workContent: string;
}) {
  return `<div class="page" data-page-index="0" style="transform: none; zoom: 1; height: auto;">
  <div class="page-inner">
    <div class="log-page-header"></div>
    <div class="log-page-content-box" style="position: absolute; top: var(--log-paper-margin-top); right: var(--log-paper-margin-right); bottom: var(--log-paper-margin-bottom); left: var(--log-paper-margin-left); width: auto; min-width: 0px; max-width: none; overflow: hidden; box-sizing: border-box; height: 998px;">
      <div class="log-page-content-frame" style="width: 100%; min-width: 0px; max-width: 100%; overflow: hidden; margin-left: auto; margin-right: auto; transform: none; transform-origin: center top; position: relative; left: 0px;">
        <table class="log-title-table" style="border-collapse: collapse !important; table-layout: fixed !important; border-spacing: 0px !important; margin: 0px auto 16px; background: rgb(255, 255, 255); overflow: hidden; width: 100% !important; max-width: 100% !important; min-width: 0px !important; box-sizing: border-box !important;">
          <tbody>
            <tr>
              <td rowspan="2" style="border: 0px; background: rgb(255, 255, 255); text-align: center; vertical-align: middle; min-height: 82px; overflow: hidden; box-sizing: border-box; padding: 6px 8px !important; min-width: 0px; white-space: normal; word-break: break-all; overflow-wrap: anywhere; line-break: anywhere;">
                <div style="font-size:24px;font-weight:800;letter-spacing:-0.02em;line-height:1.18;word-break:break-all">운영일지(아동)</div>
              </td>
              <td rowspan="2" style="width: 20px; min-width: 0px; border: 1px solid rgb(209, 213, 219); background: rgb(217, 217, 217); text-align: center; vertical-align: middle; font-weight: 800; color: rgb(17, 24, 39); line-height: 1.15; letter-spacing: 0px; overflow: hidden; box-sizing: border-box; height: 58px !important; padding: 0px !important; font-size: 9px !important; white-space: normal; word-break: break-all; overflow-wrap: anywhere; line-break: anywhere;">결<br>재</td>
              <td style="width: 58px; min-width: 0px; border: 1px solid rgb(209, 213, 219); background: rgb(217, 217, 217); text-align: center; vertical-align: middle; font-weight: 700; line-height: 1.05; color: rgb(17, 24, 39); overflow: hidden; word-break: break-all; box-sizing: border-box; height: 16px !important; padding: 0px 2px !important; font-size: 9px !important; white-space: normal; overflow-wrap: anywhere; line-break: anywhere;">담당자</td>
              <td style="width: 58px; min-width: 0px; border: 1px solid rgb(209, 213, 219); background: rgb(217, 217, 217); text-align: center; vertical-align: middle; font-weight: 700; line-height: 1.05; color: rgb(17, 24, 39); overflow: hidden; word-break: break-all; box-sizing: border-box; height: 16px !important; padding: 0px 2px !important; font-size: 9px !important; white-space: normal; overflow-wrap: anywhere; line-break: anywhere;">팀장</td>
              <td style="width: 58px; min-width: 0px; border: 1px solid rgb(209, 213, 219); background: rgb(217, 217, 217); text-align: center; vertical-align: middle; font-weight: 700; line-height: 1.05; color: rgb(17, 24, 39); overflow: hidden; word-break: break-all; box-sizing: border-box; height: 16px !important; padding: 0px 2px !important; font-size: 9px !important; white-space: normal; overflow-wrap: anywhere; line-break: anywhere;">센터장</td>
            </tr>
            <tr>
              <td style="width: 58px; min-width: 0px; border: 1px solid rgb(209, 213, 219); background: rgb(255, 255, 255); text-align: center; vertical-align: middle; overflow: hidden; box-sizing: border-box; height: 42px !important; padding: 2px !important; white-space: normal; word-break: break-all; overflow-wrap: anywhere; line-break: anywhere;"><div style="height:34px;display:flex;align-items:center;justify-content:center;font-size:9px;color:#9ca3af">미결재</div></td>
              <td style="width: 58px; min-width: 0px; border: 1px solid rgb(209, 213, 219); background: rgb(255, 255, 255); text-align: center; vertical-align: middle; overflow: hidden; box-sizing: border-box; height: 42px !important; padding: 2px !important; white-space: normal; word-break: break-all; overflow-wrap: anywhere; line-break: anywhere;"><div style="height:34px;display:flex;align-items:center;justify-content:center;font-size:9px;color:#9ca3af">미결재</div></td>
              <td style="width: 58px; min-width: 0px; border: 1px solid rgb(209, 213, 219); background: rgb(255, 255, 255); text-align: center; vertical-align: middle; overflow: hidden; box-sizing: border-box; height: 42px !important; padding: 2px !important; white-space: normal; word-break: break-all; overflow-wrap: anywhere; line-break: anywhere;"><div style="height:34px;display:flex;align-items:center;justify-content:center;font-size:9px;color:#9ca3af">미결재</div></td>
            </tr>
          </tbody>
        </table>
        <table class="log-template-table" style="height: var(--log-main-table-height); border-collapse: collapse !important; table-layout: fixed !important; border-spacing: 0px !important; margin: 0px auto 12px; overflow: hidden; width: 100% !important; max-width: 100% !important; min-width: 0px !important; box-sizing: border-box !important;">
          <colgroup>
            <col style="width:7.1377%"><col style="width:7.1377%"><col style="width:7.1377%"><col style="width:7.1377%"><col style="width:7.1377%"><col style="width:7.1377%"><col style="width:7.1377%"><col style="width:7.1377%"><col style="width:7.1377%"><col style="width:7.1377%"><col style="width:7.1377%"><col style="width:7.1377%"><col style="width:7.1377%"><col style="width:7.2105%">
          </colgroup>
          <tbody>
            <tr>
              <td colspan="2" style="border: 1px solid rgb(155, 155, 155); background: rgb(217, 217, 217); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px; font-weight: 700;"><strong>일자</strong></td>
              <td colspan="4" style="border: 1px solid rgb(155, 155, 155); background: rgb(255, 255, 255); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px;">${params.date} ${params.dayLabel}</td>
              <td colspan="2" style="border: 1px solid rgb(155, 155, 155); background: rgb(217, 217, 217); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px; font-weight: 700;"><strong>운영시간</strong></td>
              <td colspan="3" style="border: 1px solid rgb(155, 155, 155); background: rgb(255, 255, 255); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px;">${params.hours}</td>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(217, 217, 217); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px; font-weight: 700;"><strong>담당자</strong></td>
              <td colspan="2" style="border: 1px solid rgb(155, 155, 155); background: rgb(255, 255, 255); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px;">${params.author}</td>
            </tr>
            <tr>
              <td rowspan="3" style="border: 1px solid rgb(155, 155, 155); background: rgb(217, 217, 217); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px; font-weight: 700; min-height: 108px;"><span style="display:block;font-weight:700;line-height:1.08">아동<br>현황</span><span style="display:block;margin-top:1px;font-size:9px;font-weight:700;letter-spacing:-0.08em;line-height:1.05;white-space:nowrap">(취약구분)</span></td>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(217, 217, 217); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px; font-weight: 700;"><strong>성별</strong></td>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(217, 217, 217); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px; font-weight: 700;"><strong>취학전</strong></td>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(217, 217, 217); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px; font-weight: 700;"><strong>탈학교</strong></td>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(217, 217, 217); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px; font-weight: 700;"><strong>초등학교</strong></td>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(217, 217, 217); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px; font-weight: 700;"><strong>중학교</strong></td>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(217, 217, 217); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px; font-weight: 700;"><strong>고등학교</strong></td>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(217, 217, 217); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px; font-weight: 700;"><strong>기타</strong></td>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(217, 217, 217); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px; font-weight: 700;"><strong>계</strong></td>
              <td colspan="2" rowspan="3" style="border: 1px solid rgb(155, 155, 155); background: rgb(217, 217, 217); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px; font-weight: 700; min-height: 108px;">급식현황</td>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(217, 217, 217); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px; font-weight: 700;"><strong>조식</strong></td>
              <td colspan="2" style="border: 1px solid rgb(155, 155, 155); background: rgb(255, 255, 255); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px;">${params.joSik}</td>
            </tr>
            <tr>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(217, 217, 217); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px; font-weight: 700;"><strong>남</strong></td>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(255, 255, 255); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px;">${params.maleYuch}</td>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(255, 255, 255); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px;">${params.maleChul}</td>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(255, 255, 255); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px;">${params.maleJolse}</td>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(255, 255, 255); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px;">${params.maleJong}</td>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(255, 255, 255); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px;">0</td>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(255, 255, 255); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px; font-weight: 700;">${params.maleYuch + params.maleChul + params.maleJolse + params.maleJong}</td>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(217, 217, 217); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px; font-weight: 700;"><strong>중식</strong></td>
              <td colspan="2" style="border: 1px solid rgb(155, 155, 155); background: rgb(255, 255, 255); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px;">${params.jungSik}</td>
            </tr>
            <tr>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(217, 217, 217); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px; font-weight: 700;"><strong>여</strong></td>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(255, 255, 255); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px;">${params.femaleYuch}</td>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(255, 255, 255); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px;">${params.femaleChul}</td>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(255, 255, 255); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px;">${params.femaleJolse}</td>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(255, 255, 255); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px;">${params.femaleJong}</td>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(255, 255, 255); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px;">0</td>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(255, 255, 255); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px; font-weight: 700;">${params.femaleYuch + params.femaleChul + params.femaleJolse + params.femaleJong}</td>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(217, 217, 217); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px; font-weight: 700;"><strong>석식</strong></td>
              <td colspan="2" style="border: 1px solid rgb(155, 155, 155); background: rgb(255, 255, 255); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px;">${params.seokSik}</td>
            </tr>
            <tr>
              <td rowspan="2" style="border: 1px solid rgb(155, 155, 155); background: rgb(217, 217, 217); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px; font-weight: 700; min-height: 72px;"><span style="display:block;font-weight:700;line-height:1.08">아동<br>출석</span><span style="display:block;margin-top:1px;font-size:9px;font-weight:700;letter-spacing:-0.08em;line-height:1.05;white-space:nowrap">(출석구분)</span></td>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(217, 217, 217); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px; font-weight: 700;"><strong>정원</strong></td>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(217, 217, 217); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px; font-weight: 700;"><strong>현원</strong></td>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(217, 217, 217); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px; font-weight: 700;"><strong>출석</strong></td>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(217, 217, 217); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px; font-weight: 700;"><strong>공결</strong></td>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(217, 217, 217); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px; font-weight: 700;"><strong>대체출석</strong></td>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(217, 217, 217); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px; font-weight: 700;"><strong>결석</strong></td>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(217, 217, 217); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px; font-weight: 700;"><strong>기타</strong></td>
              <td colspan="2" rowspan="2" style="border: 1px solid rgb(155, 155, 155); background: rgb(217, 217, 217); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px; font-weight: 700; min-height: 72px;">교사현황</td>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(217, 217, 217); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px; font-weight: 700;"><strong>종사자</strong></td>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(217, 217, 217); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px; font-weight: 700;"><strong>교사</strong></td>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(217, 217, 217); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px; font-weight: 700;"><strong>공익</strong></td>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(217, 217, 217); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px; font-weight: 700;"><strong>기타</strong></td>
            </tr>
            <tr>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(255, 255, 255); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px;">${params.jeongwon}</td>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(255, 255, 255); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px;">${params.hyenwon}</td>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(255, 255, 255); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px;">${params.chulgeuk}</td>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(255, 255, 255); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px;">${params.daeche}</td>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(255, 255, 255); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px;">${params.gyelsok}</td>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(255, 255, 255); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px;">${params.gita}</td>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(255, 255, 255); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px;">${params.staffJong}</td>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(255, 255, 255); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px;">${params.staffGyo}</td>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(255, 255, 255); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px;">${params.staffGong}</td>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(255, 255, 255); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px;">${params.staffGita}</td>
            </tr>
            <tr>
              <td colspan="14" style="border: 1px solid rgb(155, 155, 155); background: rgb(217, 217, 217); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px; font-weight: 700;"><strong>통합 관리</strong></td>
            </tr>
            <tr>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(217, 217, 217); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px; font-weight: 700;"><strong>종사자</strong></td>
              <td colspan="13" style="border: 1px solid rgb(155, 155, 155); background: rgb(255, 255, 255); text-align: left; vertical-align: middle; padding: 4px 5px; font-size: 10.5px;">${params.gyosilChulgin}</td>
            </tr>
            <tr>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(217, 217, 217); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px; font-weight: 700;"><strong>아동</strong></td>
              <td colspan="13" style="border: 1px solid rgb(155, 155, 155); background: rgb(255, 255, 255); text-align: left; vertical-align: middle; padding: 4px 5px; font-size: 10.5px;">${params.absentNames}</td>
            </tr>
            <tr>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(217, 217, 217); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px; font-weight: 700;"><strong>방문자</strong></td>
              <td colspan="13" style="border: 1px solid rgb(155, 155, 155); background: rgb(255, 255, 255); text-align: left; vertical-align: middle; padding: 4px 5px; font-size: 10.5px;">${params.visitorInfo}</td>
            </tr>
            <tr>
              <td class="log-work-label-cell" style="border: 1px solid rgb(155, 155, 155); background: rgb(217, 217, 217); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px; font-weight: 700; height: 250px !important;">업무<br>내용</td>
              <td class="log-work-content-cell" colspan="13" style="border: 1px solid rgb(155, 155, 155); background: rgb(255, 255, 255); text-align: left; vertical-align: top; padding: 7px 8px; font-size: 10.5px; height: 250px !important; line-height: 1.5;">${params.workContent}</td>
            </tr>
            <tr>
              <td style="border: 1px solid rgb(155, 155, 155); background: rgb(217, 217, 217); text-align: center; vertical-align: middle; padding: 4px 5px; font-size: 10.5px; font-weight: 700;"><strong>기타</strong></td>
              <td colspan="13" style="border: 1px solid rgb(155, 155, 155); background: rgb(255, 255, 255); text-align: left; vertical-align: middle; padding: 4px 5px; font-size: 10.5px;">&nbsp;</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="log-page-footer"></div>
  </div>
</div>`;
}

export const MOCK_DAILY_LOGS: DailyLog[] = [
  {
    id: "dl-001",
    date: "2026-06-28",
    title: "2026년 6월 28일 토요일 운영일지",
    authorName: "윤희빈",
    authorRole: "사회복지사",
    status: "approved",
    createdAt: Date.now() - 1000 * 60 * 60 * 3,
    updatedAt: Date.now() - 1000 * 60 * 60 * 3,
    content: makeLogHtml({
      author: "윤희빈",
      date: "2026년 6월 28일", dayLabel: "토", hours: "방학중 (09:00 ~ 18:00)",
      maleYuch: "0", maleChul: "1", maleJolse: "0", maleJong: "7",
      femaleYuch: "0", femaleChul: "0", femaleJolse: "0", femaleJong: "6",
      jeongwon: "35", hyenwon: "14", chulgeuk: "0", daeche: "0", gyelsok: "0", gita: "2",
      joSik: "0", jungSik: "14", seokSik: "0",
      staffJong: "1", staffGyo: "1", staffGong: "1", staffGita: "1",
      gyosilChulgin: "출근 : 왕시형(센터장), 윤희빈(사회복지사) / 2명",
      absentNames: "결석 : 김예원, 김하나 / 2명",
      visitorInfo: "교사 : 김홍매 / 1명 · 공익 : 노지현 / 1명 · 멘토 : 장효정 / 1명",
      workContent: `<div style="padding:0 2px">
        <div style="padding:2px 0">* 행정 업무 및 일지 작성</div>
        <div style="padding:2px 0">* 점심식사 후 휴식</div>
        <div style="padding:2px 0">* 간식 배분, 자율 활동</div>
        <div style="padding:2px 0">* 저녁식사 배식지원 및 인원점검</div>
        <div style="padding:2px 0">* 안전귀가지도 및 행정 업무</div>
        <div style="padding:2px 0">* 수학 기초 학습</div>
        <div style="padding:2px 0">* 멘토 활동 및 독후감 활동</div>
      </div>`,
    }),
  },
  {
    id: "dl-002",
    date: "2026-06-27",
    title: "2026년 6월 27일 금요일 운영일지",
    authorName: "최하은",
    authorRole: "사회복지사",
    status: "pending",
    createdAt: Date.now() - 1000 * 60 * 60 * 27,
    updatedAt: Date.now() - 1000 * 60 * 60 * 27,
    content: makeLogHtml({
      author: "최하은",
      date: "2026년 6월 27일", dayLabel: "금", hours: "방학중 (09:00 ~ 18:00)",
      maleYuch: "0", maleChul: "2", maleJolse: "0", maleJong: "8",
      femaleYuch: "0", femaleChul: "1", femaleJolse: "0", femaleJong: "7",
      jeongwon: "35", hyenwon: "18", chulgeuk: "0", daeche: "0", gyelsok: "0", gita: "1",
      joSik: "0", jungSik: "18", seokSik: "0",
      staffJong: "1", staffGyo: "2", staffGong: "1", staffGita: "1",
      gyosilChulgin: "출근 : 왕시형(센터장), 최하은(사회복지사), 윤희빈(사회복지사) / 3명 / 연차 : 왕준하(팀장 / 1일)",
      absentNames: "결석 : 김예원 / 1명",
      visitorInfo: "교사 : 김홍매 / 1명",
      workContent: `<div style="padding:0 2px">
        <div style="padding:2px 0">* 오전 급식 준비 및 배식</div>
        <div style="padding:2px 0">* 아동 숙제 지도</div>
        <div style="padding:2px 0">* 여름방학 프로그램 운영</div>
        <div style="padding:2px 0">* 오후 간식 배분</div>
        <div style="padding:2px 0">* 안전교육 실시</div>
      </div>`,
    }),
  },
  {
    id: "dl-003",
    date: "2026-06-26",
    title: "2026년 6월 26일 목요일 운영일지",
    authorName: "윤희빈",
    authorRole: "사회복지사",
    status: "draft",
    createdAt: Date.now() - 1000 * 60 * 60 * 51,
    updatedAt: Date.now() - 1000 * 60 * 60 * 51,
    content: makeLogHtml({
      author: "윤희빈",
      date: "2026년 6월 26일", dayLabel: "목", hours: "방학중 (09:00 ~ 18:00)",
      maleYuch: "0", maleChul: "1", maleJolse: "0", maleJong: "9",
      femaleYuch: "0", femaleChul: "0", femaleJolse: "1", femaleJong: "7",
      jeongwon: "35", hyenwon: "18", chulgeuk: "0", daeche: "0", gyelsok: "0", gita: "2",
      joSik: "0", jungSik: "18", seokSik: "0",
      staffJong: "1", staffGyo: "1", staffGong: "1", staffGita: "1",
      gyosilChulgin: "출근 : 왕시형(센터장), 윤희빈(사회복지사) / 2명",
      absentNames: "결석 : 김예원, 김하나 / 2명",
      visitorInfo: "없음",
      workContent: `<div style="padding:0 2px">
        <div style="padding:2px 0">* 조식 및 오전 활동 준비</div>
        <div style="padding:2px 0">* 문화예술 활동 (미술)</div>
        <div style="padding:2px 0">* 점심식사 지원</div>
        <div style="padding:2px 0">* 방과후 학습</div>
      </div>`,
    }),
  },
];
